// scripts/fetch-fonts.js
// Fetch Google Fonts CSS for Noto Sans SC, extract woff2 URL and download to public/fonts/
const https = require('https');
const fs = require('fs');
const path = require('path');

const cssUrl = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap';
const outDir = path.join(__dirname, '..', 'public', 'fonts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function download(url, file) {
  return new Promise((resolve, reject) => {
    const f = fs.createWriteStream(file);
    https.get(url, (res) => {
      res.pipe(f);
      f.on('finish', () => { f.close(); resolve(); });
    }).on('error', (err) => reject(err));
  });
}

(async () => {
  try {
    console.log('Fetching Google Fonts CSS...');
    const css = await fetchText(cssUrl);
    const m = css.match(/url\((https:\\/\\/fonts.gstatic.com\\/[^)]+\.woff2)\)/);
    if (m && m[1]) {
      const fontUrl = m[1].replace(/\\/g, '');
      console.log('Downloading font:', fontUrl);
      await download(fontUrl, path.join(outDir, 'NotoSansSC.woff2'));
      console.log('Font downloaded to public/fonts/NotoSansSC.woff2');
    } else {
      console.warn('woff2 URL not found in CSS');
    }
  } catch (e) { console.error('fetch-fonts failed', e); }
})();
