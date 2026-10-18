/**
 * orthogonalAStar.ts
 * Basic A* on a grid for orthogonal/45-degree routing with obstacles.
 * This implementation is intentionally simple and includes a max-iteration cutoff
 * so it can be used as a best-effort "high-quality" router called on demand.
 */

export interface GridNode { x: number; y: number; g: number; f: number; parent?: GridNode }

export function orthogonalAStar(start: { x: number; y: number }, goal: { x: number; y: number }, obstacles: { x: number; y: number; r: number }[], gridSize = 16, maxIter = 20000) {
  const snap = (p: { x: number; y: number }) => ({ x: Math.round(p.x / gridSize) * gridSize, y: Math.round(p.y / gridSize) * gridSize });
  const s = snap(start), g = snap(goal);

  const key = (n: { x: number; y: number }) => `${n.x}_${n.y}`;

  const isBlocked = (x: number, y: number) => {
    for (const o of obstacles) {
      const d = Math.hypot(o.x - x, o.y - y);
      if (d < o.r + gridSize * 0.6) return true;
    }
    return false;
  };

  const openMap = new Map<string, GridNode>();
  const closed = new Set<string>();
  const startNode: GridNode = { x: s.x, y: s.y, g: 0, f: Math.hypot(g.x - s.x, g.y - s.y) };
  openMap.set(key(startNode), startNode);

  let iterations = 0;
  while (openMap.size > 0 && iterations++ < maxIter) {
    // pick lowest f
    let currentKey: string | null = null; let current: GridNode | undefined;
    for (const [k, v] of openMap.entries()) { if (!current || v.f < current.f) { current = v; currentKey = k; } }
    if (!current || !currentKey) break;
    if (current.x === g.x && current.y === g.y) {
      // reconstruct
      const out: { x: number; y: number }[] = [];
      let cur: GridNode | undefined = current;
      while (cur) { out.push({ x: cur.x, y: cur.y }); cur = cur.parent; }
      return out.reverse();
    }
    openMap.delete(currentKey);
    closed.add(currentKey);

    const neighOffsets = [
      { dx: gridSize, dy: 0 }, { dx: -gridSize, dy: 0 }, { dx: 0, dy: gridSize }, { dx: 0, dy: -gridSize },
      { dx: gridSize, dy: gridSize }, { dx: gridSize, dy: -gridSize }, { dx: -gridSize, dy: gridSize }, { dx: -gridSize, dy: -gridSize }
    ];

    for (const off of neighOffsets) {
      const nx = current.x + off.dx; const ny = current.y + off.dy;
      const k = `${nx}_${ny}`;
      if (closed.has(k)) continue;
      if (isBlocked(nx, ny)) continue;
      const tentativeG = current.g + Math.hypot(off.dx, off.dy) + (off.dx !== 0 && off.dy !== 0 ? 10 : 0); // penalize diag slightly
      const h = Math.hypot(g.x - nx, g.y - ny);
      const f = tentativeG + h;
      const existing = openMap.get(k);
      if (!existing || tentativeG < existing.g) {
        openMap.set(k, { x: nx, y: ny, g: tentativeG, f, parent: current });
      }
    }
  }

  // fallback: straight line
  return [start, goal];
}
