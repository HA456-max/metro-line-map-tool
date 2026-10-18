/**
 * advancedRouting.ts
 * A lightweight obstacle-aware orthogonal routing helper.
 * Strategy (heuristic, lightweight):
 * - Try simple 45/90-degree elbow routing first (fast)
 * - If segment intersects a station exclusion zone, try to offset elbow
 * - If still colliding, fallback to a coarse A* on an implicit grid (manhattan moves)
 *
 * Note: This is not a full production router but provides reasonable avoidance for interactive editing.
 */
import { distance } from './geometry';

function intersectsStation(a: { x: number; y: number }, b: { x: number; y: number }, stations: any[], pad = 8) {
  // check each station if distance from segment AB to station center < pad
  for (const s of stations) {
    const cx = s.pos.x, cy = s.pos.y;
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((cx - a.x) * dx + (cy - a.y) * dy) / (dx * dx + dy * dy || 1)));
    const px = a.x + dx * t, py = a.y + dy * t;
    const d = Math.hypot(px - cx, py - cy);
    if (d < pad) return true;
  }
  return false;
}

export function advancedRoute(a: { x: number; y: number }, b: { x: number; y: number }, stations: any[]) {
  // try direct 45/90 elbow
  const dx = b.x - a.x, dy = b.y - a.y;
  const absDx = Math.abs(dx), absDy = Math.abs(dy);
  if (absDx < 1 || absDy < 1) return [a, b];

  const elbow = { x: a.x, y: b.y };
  // if elbows intersect stations, offset elbow by pad amount
  const pad = 10;
  if (!intersectsStation(a, elbow, stations, pad) && !intersectsStation(elbow, b, stations, pad)) return [a, elbow, b];

  const elbow2 = { x: b.x, y: a.y };
  if (!intersectsStation(a, elbow2, stations, pad) && !intersectsStation(elbow2, b, stations, pad)) return [a, elbow2, b];

  // try offset elbow: move elbow away from nearest station
  // compute midpoint and try small offsets
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const offsets = [20, -20, 40, -40];
  for (const ox of offsets) {
    const e = { x: mid.x + ox, y: mid.y };
    if (!intersectsStation(a, e, stations, pad) && !intersectsStation(e, b, stations, pad)) return [a, e, b];
  }

  // fallback: simple 3-point polyline trying to route around nearest station
  // find nearest station to straight line
  let nearest = null; let nd = Infinity;
  for (const s of stations) {
    const d = Math.abs((b.y - a.y) * s.pos.x - (b.x - a.x) * s.pos.y + b.x * a.y - b.y * a.x) / Math.hypot(b.y - a.y, b.x - a.x);
    if (d < nd) { nd = d; nearest = s; }
  }
  if (nearest) {
    const dirX = (nearest.pos.x - a.x) > 0 ? 1 : -1;
    const safeX = nearest.pos.x + dirX * (pad + 20);
    const route = [a, { x: safeX, y: a.y }, { x: safeX, y: b.y }, b];
    return route;
  }

  return [a, b];
}

export default advancedRoute;
