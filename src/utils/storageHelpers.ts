export function saveLargeJSON(keyPrefix: string, obj: any) {
  const str = JSON.stringify(obj);
  const chunkSize = 1024 * 800;
  const chunks = [];
  for (let i = 0; i < str.length; i += chunkSize) chunks.push(str.slice(i, i + chunkSize));
  localStorage.setItem(`${keyPrefix}::meta`, JSON.stringify({ chunks: chunks.length }));
  chunks.forEach((c, idx) => localStorage.setItem(`${keyPrefix}::${idx}`, c));
}

export function loadLargeJSON(keyPrefix: string) {
  const meta = localStorage.getItem(`${keyPrefix}::meta`);
  if (!meta) return null;
  const { chunks } = JSON.parse(meta);
  let s = '';
  for (let i = 0; i < chunks; i++) {
    const c = localStorage.getItem(`${keyPrefix}::${i}`);
    if (c === null) return null;
    s += c;
  }
  return JSON.parse(s);
}
