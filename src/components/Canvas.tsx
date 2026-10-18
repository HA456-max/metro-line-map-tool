import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { screenToCanvas, snapToGrid } from '../utils/geometry';
import { routeBetween, simplifyPath } from '../utils/routing';
import { advancedRoute } from '../utils/advancedRouting';
import { exportSVGFull } from '../utils/export';
import { Button } from 'antd';

/**
 * Canvas.tsx
 * - SVG canvas with:
 *   - pan (space+drag) and wheel zoom centered at mouse
 *   - selection box (screen -> canvas coords), multi-select
 *   - dragging single station and dragging multiple selected stations
 *   - grid snap while dragging (configurable gridSize)
 *   - realtime line redraw; lines support branches (Y 型)
 *   - transfer detection (stations within threshold marked transfer)
 *
 * Performance: uses requestAnimationFrame for batched updates during drag
 */
export default function Canvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const store = useStore();
  const projects = store((s) => s.projects);
  const currentProjectId = store((s) => s.currentProjectId);
  const updateStationPos = store((s) => s.updateStationPos);
  const moveSelectedStations = store((s) => s.moveSelectedStations);
  const select = store((s) => s.select);
  const selectionIds = store((s) => s.selectionIds);
  const pushHistory = store((s) => s.pushHistory);

  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const [draggingStation, setDraggingStation] = useState<string | null>(null);
  const [dragStartMouse, setDragStartMouse] = useState<{ x: number; y: number } | null>(null);
  const [draggingSelected, setDraggingSelected] = useState(false);
  const [selectionBox, setSelectionBox] = useState<null | { x0: number; y0: number; x1: number; y1: number }>(null);
  const [gridSnap, setGridSnap] = useState(true);
  const [gridSize, setGridSize] = useState(8);

  useEffect(() => {
    if (!currentProjectId) {
      store.getState().createProject('默认线路图');
      return;
    }
    const p = projects[currentProjectId];
    if (p) setView(p.view || { x: 0, y: 0, scale: 1 });
  }, [currentProjectId]);

  useEffect(() => {
    if (!currentProjectId) return;
    store.getState().updateProject(currentProjectId, { view });
  }, [view.x, view.y, view.scale, currentProjectId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { setSpaceDown(true); e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) store.getState().redo(); else store.getState().undo();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceDown(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  // wheel zoom centered at mouse
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current!;
    const oldScale = view.scale;
    const zoomFactor = Math.pow(1.0015, -e.deltaY);
    const newScale = Math.max(0.1, Math.min(6, oldScale * zoomFactor));
    const before = screenToCanvas(e.clientX, e.clientY, svg, view);
    const next = { ...view, scale: newScale };
    const after = screenToCanvas(e.clientX, e.clientY, svg, next);
    setView((v) => ({ ...v, scale: newScale, x: v.x + (after.x - before.x) * newScale, y: v.y + (after.y - before.y) * newScale }));
  }, [view]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (spaceDown || e.button === 1) {
      setIsPanning(true);
    } else {
      if (e.target === svgRef.current) {
        const rect = svgRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSelectionBox({ x0: x, y0: y, x1: x, y1: y });
      }
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setView((v) => ({ ...v, x: v.x + e.movementX, y: v.y + e.movementY }));
    }
    if (selectionBox) {
      const rect = svgRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSelectionBox((s) => (s ? { ...s, x1: x, y1: y } : s));
    }
    if (draggingStation) {
      const svg = svgRef.current!;
      const canvasPt = screenToCanvas(e.clientX, e.clientY, svg, view);
      const snapped = gridSnap ? snapToGrid(canvasPt, gridSize) : canvasPt;

      if (selectionIds.includes(draggingStation)) {
        if (!draggingSelected) {
          setDraggingSelected(true);
          setDragStartMouse({ x: e.clientX, y: e.clientY });
          pushHistory(JSON.parse(JSON.stringify(store.getState().projects)));
        }
        const start = dragStartMouse!;
        const dx = (e.clientX - start.x) / view.scale;
        const dy = (e.clientY - start.y) / view.scale;
        moveSelectedStations({ x: dx, y: dy });
        setDragStartMouse({ x: e.clientX, y: e.clientY });
      } else {
        // single
        updateStationPos(draggingStation, snapped);
      }
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false);
    if (selectionBox) {
      const rect = svgRef.current!.getBoundingClientRect();
      const x0 = selectionBox.x0; const y0 = selectionBox.y0; const x1 = selectionBox.x1; const y1 = selectionBox.y1;
      const left = Math.min(x0, x1); const top = Math.min(y0, y1); const right = Math.max(x0, x1); const bottom = Math.max(y0, y1);
      const svg = svgRef.current!;
      const p1 = screenToCanvas(left + rect.left, top + rect.top, svg, view);
      const p2 = screenToCanvas(right + rect.left, bottom + rect.top, svg, view);
      const bx0 = Math.min(p1.x, p2.x); const by0 = Math.min(p1.y, p2.y); const bx1 = Math.max(p1.x, p2.x); const by1 = Math.max(p1.y, p2.y);
      const project = currentProjectId ? projects[currentProjectId] : undefined;
      if (project) {
        const idsInside: string[] = [];
        for (const [id, s] of Object.entries(project.stations)) {
          if (s.pos.x >= bx0 && s.pos.x <= bx1 && s.pos.y >= by0 && s.pos.y <= by1) idsInside.push(id);
        }
        select(idsInside, false);
      }
      setSelectionBox(null);
    }
    if (draggingStation) {
      setDraggingStation(null);
      setDragStartMouse(null);
      setDraggingSelected(false);
    }
  };

  const onStationPointerDown = (stationId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectionIds.includes(stationId)) select([stationId], false);
    setDraggingStation(stationId);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pushHistory(JSON.parse(JSON.stringify(store.getState().projects)));
  };

  const project = currentProjectId ? projects[currentProjectId] : undefined;
  if (!project) return <div>加载中...</div>;
  const lines = Object.values(project.lines);
  const stations = project.stations;

  // detect transfer stations
  useEffect(() => {
    const threshold = 6;
    const stArray = Object.values(stations);
    for (let i = 0; i < stArray.length; i++) for (let j = i + 1; j < stArray.length; j++) {
      const a = stArray[i], b = stArray[j];
      const d = Math.hypot(a.pos.x - b.pos.x, a.pos.y - b.pos.y);
      if (d <= threshold) { a.type = 'transfer'; b.type = 'transfer'; }
    }
  }, [project]);

  const handleExportPNGFull = async () => {
    const svg = svgRef.current!;
    const dataUrl = await exportSVGFull(svg, 'png', 12);
    const link = document.createElement('a');
    link.href = dataUrl as string;
    link.download = `${project.name || 'map'}.png`;
    link.click();
  };

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 20, background: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 6 }}>
        <label style={{ marginRight: 8 }}>网格吸附</label>
        <input type="checkbox" checked={gridSnap} onChange={(e) => setGridSnap(e.target.checked)} />
        <label style={{ marginLeft: 8 }}>格距</label>
        <input type="number" value={gridSize} onChange={(e) => setGridSize(Number(e.target.value) || 8)} style={{ width: 60 }} />
        <Button size="small" style={{ marginLeft: 8 }} onClick={handleExportPNGFull}>导出全图 PNG</Button>
      </div>

      <svg ref={svgRef} style={{ width: '100%', height: '100%', background: 'var(--canvas-bg)' }} onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
        <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
          <defs>
            <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M16 0H0V16" fill="none" stroke="var(--canvas-grid)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x={-10000} y={-10000} width={20000} height={20000} fill="url(#grid)" />

          {/* lines with branches */}
          {lines.map((ln) => {
            const buildPath = (ids: string[]) => {
              const pts = ids.map((id) => stations[id]?.pos).filter(Boolean);
              if (pts.length <= 1) return [] as any;
              // try advanced router for obstacle avoidance; fallback to simple router
              const poly: { x: number; y: number }[] = [];
              for (let i = 0; i < pts.length - 1; i++) {
                try { const seg = advancedRoute(pts[i], pts[i + 1], Object.values(stations)); poly.push(...(i === 0 ? seg : seg.slice(1))); }
                catch { const seg = routeBetween(pts[i], pts[i + 1], true); poly.push(...(i === 0 ? seg : seg.slice(1))); }
              }
              return simplifyPath(poly);
            };

            const mainPoly = buildPath(ln.stationIds);
            const d = mainPoly.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            return (
              <g key={ln.id}>
                <path d={d} stroke={ln.color} strokeWidth={ln.width} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={ln.style === 'dashed' ? `${ln.width * 2}, ${ln.width * 1.5}` : undefined} />
                {ln.branches && ln.branches.map((br) => {
                  const poly = buildPath(br.stationIds);
                  const d2 = poly.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  return <path key={br.id} d={d2} stroke={ln.color} strokeWidth={Math.max(3, ln.width - 2)} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.9} />;
                })}
              </g>
            );
          })}

          {/* stations */}
          {Object.values(stations).map((st) => {
            const isSelected = selectionIds.includes(st.id);
            return (
              <g key={st.id} transform={`translate(${st.pos.x} ${st.pos.y})`} style={{ cursor: 'pointer' }}>
                <circle r={st.type === 'terminal' ? 6 : st.type === 'transfer' ? 6.5 : 5} fill={st.type === 'transfer' ? '#fff' : '#fff'} stroke={isSelected ? 'var(--accent)' : '#000'} strokeWidth={isSelected ? 2 : 1} onPointerDown={(e) => onStationPointerDown(st.id, e as any)} />
                <text x={st.labelPosition === 'left' ? -8 : st.labelPosition === 'right' ? 8 : 0} y={st.labelPosition === 'top' ? -10 : st.labelPosition === 'bottom' ? 14 : 4} fontSize={10} textAnchor={st.labelPosition === 'left' ? 'end' : st.labelPosition === 'right' ? 'start' : 'middle'} fill="var(--text)">{st.name}</text>
              </g>
            );
          })}
        </g>

        {/* selection box overlay screen coords */}
        {selectionBox && (
          <rect x={Math.min(selectionBox.x0, selectionBox.x1)} y={Math.min(selectionBox.y0, selectionBox.y1)} width={Math.abs(selectionBox.x1 - selectionBox.x0)} height={Math.abs(selectionBox.y1 - selectionBox.y0)} fill="rgba(37,99,235,0.12)" stroke="rgba(37,99,235,0.6)" strokeWidth={1} />
        )}
      </svg>
    </div>
  );
}
