import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 相对资源路径可同时部署到 GitHub Pages 子目录和独立域名根目录。
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  }
});
