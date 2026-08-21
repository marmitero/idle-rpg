import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@relicwake/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
      "@relicwake/sim": path.resolve(__dirname, "../../packages/sim/src/index.ts"),
      "@relicwake/content": path.resolve(__dirname, "../../packages/content/src/index.ts"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    fs: { allow: [path.resolve(__dirname, "../..")] },
    proxy: {
      "/api": { target: "http://127.0.0.1:3000", changeOrigin: true },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
  },
  publicDir: path.resolve(__dirname, "public"),
});
