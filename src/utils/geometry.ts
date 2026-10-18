export function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function snapToGrid(p: { x: number; y: number }, gridSize: number) {
  return { x: Math.round(p.x / gridSize) * gridSize, y: Math.round(p.y / gridSize) * gridSize };
}

export function screenToCanvas(clientX: number, clientY: number, svg: SVGSVGElement, view: { x: number; y: number; scale: number }) {
  const rect = svg.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const x = (sx - cx - view.x) / view.scale;
  const y = (sy - cy - view.y) / view.scale;
  return { x, y };
}

export function canvasToScreen(x: number, y: number, svg: SVGSVGElement, view: { x: number; y: number; scale: number }) {
  const rect = svg.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const sx = cx + view.x + x * view.scale;
  const sy = cy + view.y + y * view.scale;
  return { clientX: sx + rect.left, clientY: sy + rect.top };
}
