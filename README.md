# Metro Line Map Tool

纯前端地铁线路图绘制工具（React + TypeScript + Vite）。

功能亮点：
- SVG 画布交互（缩放/平移/拖拽）
- 线路管理、站点管理、换乘识别
- 框选、多选、批量移动
- 导出 PNG / SVG（视口 / 全图）
- JSON 导入/导出与 Zod 校验
- UI 风格自定义与持久化
- PWA 支持

启动

```bash
npm install
npm run dev
```

部署

- Vercel/Netlify/GitHub Pages 均支持；若部署到仓库页面，请在 vite.config.ts 设置 base 为 '/<repo>/'.


