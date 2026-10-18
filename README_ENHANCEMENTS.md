### 第二阶段增强版 — 已添加功能清单和说明

我已在仓库中追加并实现这些核心模块：

1) 完整 SVG 画布交互（src/components/Canvas.tsx）
   - 支持多选/框选、单点与批量拖动、网格吸附（可配置）、鼠标为中心的缩放、平移（空格拖动）
   - 多层渲染：网格 | 线路（含支线） | 站点
   - 使用 requestAnimationFrame 思路保持拖动性能

2) Y 型支线与线路分支绘制（Canvas 已渲染 line.branches）

3) 更高级路由（src/utils/advancedRouting.ts）
   - 轻量的障碍规避策略：优先 45°/90° 肘点，若与站点发生冲突尝试偏移肘点或生成绕行点
   - 作为路由的快速启发式，兼顾交互性能

4) 导入/导出 UI（src/components/ImportExportModal.tsx）和冲突 modal（src/components/ConflictModal.tsx）
   - 支持导出当前工程 JSON
   - 导入时可选择三种冲突策略：rename / overwrite / merge（store 已实现对应策略）

5) PNG 全图导出 已绑定到 Canvas 工具栏（调用 src/utils/export.exportSVGFull）

6) 字体内联助手（src/utils/fontInline.ts）
   - 可 fetch woff2 并注入 page 的 @font-face，用于改善导出 PNG 时的中文字体缺失问题

7) 小幅 UI 与交互增强（工具栏导出按钮、Canvas 左上角网格开关）

如何验证
- git pull && npm install && npm run dev
- 打开编辑器，创建线路/站点，测试：框选、多选、拖动、改变网格、导出全图
- 导入/导出：在侧边栏打开导入导出模态（我可再把入口按钮加入 Toolbar/Sidebar，如需我可以添加）

下一步我建议：
- 我将把 Import/Export Modal 的入口按钮加到 Toolbar（并提供完整的冲突弹窗流程），同时完善 LineEditor 的 Y 型编辑 UI（拖拽创建分支连接点、可视化分支操作）。
- 若你希望，我也可以把 advancedRouting 的 A* 网格版本补上（更鲁棒但更耗计算），并提供开关以在大型工程中切换性能/质量。

要我现在继续：
- A）把导入/导出入口集成到 Toolbar 并完善冲突弹窗流程
- B）实现交互式 Y 型支线编辑（拖拽端点以创建分支）
- C）补充更完整的 A* orthogonal router
- D）把 PWA 离线能力和字体内联自动化整合到导出流程

请选择你要我优先做的任务（可以多选，按优先级排序）。