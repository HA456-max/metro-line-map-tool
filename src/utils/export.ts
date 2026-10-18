import { toPng, toSvg } from 'html-to-image';

function computeBBoxOfClone(root: SVGSVGElement) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const elems = Array.from(root.querySelectorAll<SVGGraphicsElement>('path,circle,rect,line,polyline,polygon,text,g'));
  elems.forEach((el) => {
    try {
      const bbox = el.getBBox();
      if (Number.isFinite(bbox.x)) {
        minX = Math.min(minX, bbox.x);
        minY = Math.min(minY, bbox.y);
        maxX = Math.max(maxX, bbox.x + bbox.width);
        maxY = Math.max(maxY, bbox.y + bbox.height);
      }
    } catch (e) {}
  });
  if (minX === Infinity) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export async function exportSVGFull(svgNode: SVGSVGElement, type: 'png' | 'svg' = 'png', padding = 10) {
  const clone = svgNode.cloneNode(true) as SVGSVGElement;
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = `${svgNode.clientWidth}px`;
  container.style.height = `${svgNode.clientHeight}px`;
  container.appendChild(clone);
  document.body.appendChild(container);

  let bbox = computeBBoxOfClone(clone);
  if (!bbox) bbox = { x: -100, y: -100, width: svgNode.clientWidth + 200, height: svgNode.clientHeight + 200 };
  const viewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
  clone.setAttribute('viewBox', viewBox);
  clone.setAttribute('width', `${bbox.width + padding * 2}`);
  clone.setAttribute('height', `${bbox.height + padding * 2}`);

  if (type === 'svg') {
    const svgStr = new XMLSerializer().serializeToString(clone);
    document.body.removeChild(container);
    return svgStr;
  } else {
    const dataUrl = await toPng(clone as unknown as HTMLElement, { backgroundColor: 'transparent', cacheBust: true });
    document.body.removeChild(container);
    return dataUrl;
  }
}

/* 中文字体内联方案：建议在 index.html 或在运行时注入 @font-face，使用 base64 内联 woff2 文件到 CSS，
   确保在导出前等待字体加载。 */
