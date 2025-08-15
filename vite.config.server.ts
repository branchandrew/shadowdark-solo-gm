import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/node-build.ts"),
      name: "server", 
      fileName: "node-build",
      formats: ["es"],
    },
    outDir: "dist/server",
    target: "node14",
    ssr: true,
    rollupOptions: {
      external: ["fs", "path", "url", "http", "https", "os", "crypto", "stream", "util", "events", "buffer", "querystring", "child_process", "net", "tls", "zlib"],
      output: {
        format: "es",
        entryFileNames: "[name].mjs",
        banner: `import fetch from 'node-fetch'; globalThis.fetch = fetch;`
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
