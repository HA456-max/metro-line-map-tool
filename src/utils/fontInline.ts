/**
 * fontInline.ts
 * Helper to inline a WOFF2 font by fetching it and injecting an @font-face with base64.
 * Returns a promise that resolves when the font is loaded via FontFaceSet.
 */
export async function inlineFontToPage(url: string, family: string) {
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    const css = `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${base64}) format('woff2');font-weight:400;font-style:normal;font-display:swap}`;
    const style = document.createElement('style');
    style.setAttribute('data-inline-font', family);
    style.textContent = css;
    document.head.appendChild(style);
    // wait for font to be available
    await document.fonts.load(`1em ${family}`);
    return true;
  } catch (e) {
    console.error('inline font failed', e);
    return false;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
