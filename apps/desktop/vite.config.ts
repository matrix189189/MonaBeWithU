import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(__dirname, "src/renderer"),
  base: "./",
  build: {
    outDir: resolve(__dirname, "out/renderer"),
    emptyOutDir: true,
    target: "es2022",
  },
  resolve: {
    // Let Vite resolve workspace packages by preserving symlinks
    preserveSymlinks: false,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
