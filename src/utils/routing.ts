import { distance } from './geometry';

export function snapAngle45(dx: number, dy: number) {
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const snapped = Math.round(angle / 45) * 45;
  const rad = (snapped * Math.PI) / 180;
  return { angle: snapped, dir: { x: Math.cos(rad), y: Math.sin(rad) } };
}

export function routeBetween(a: { x: number; y: number }, b: { x: number; y: number }, allow45 = true) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = distance(a, b);
  if (dist < 1) return [a, b];
  if (!allow45) {
    const elbow1 = { x: a.x, y: b.y };
    const elbow2 = { x: b.x, y: a.y };
    const len1 = Math.abs(elbow1.x - a.x) + Math.abs(b.y - elbow1.y);
    const len2 = Math.abs(elbow2.x - a.x) + Math.abs(b.y - elbow2.y);
    const elbow = len1 <= len2 ? elbow1 : elbow2;
    return [a, elbow, b];
  } else {
    const { angle } = snapAngle45(dx, dy);
    const mod90 = Math.abs(angle % 90);
    if (mod90 === 0) {
      return [a, b];
    } else {
      const elbow = { x: a.x, y: b.y };
      if (distance(a, elbow) < 1) return [a, b];
      return [a, elbow, b];
    }
  }
}

export function simplifyPath(points: { x: number; y: number }[]) {
  if (points.length <= 2) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = out[out.length - 1];
    const cur = points[i];
    const next = points[i + 1];
    const vx1 = cur.x - prev.x;
    const vy1 = cur.y - prev.y;
    const vx2 = next.x - cur.x;
    const vy2 = next.y - cur.y;
    if (Math.abs(vx1 * vy2 - vy1 * vx2) < 0.001) {
      continue;
    } else {
      out.push(cur);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}
