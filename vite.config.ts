import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    // 宝塔环境可能在 dist 下放置 .user.ini（文件），
    // 关闭 Vite 内置清空，避免误把文件当目录扫描导致 ENOTDIR。
    emptyOutDir: false,
  },
});
