import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// 设置 base 为仓库名子路径，避免 GitHub Pages 白屏（静态资源 404）
const repoBase = '//';

export default defineConfig({
  base: repoBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Metro Line Map Tool',
        short_name: 'MetroMap',
        description: '纯前端地铁线路图绘制工具',
        theme_color: '#ffffff',
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});
