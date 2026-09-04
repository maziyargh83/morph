import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: "src/server.ts",
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  ssr: {
    // Bundle workspace TypeScript while leaving npm runtime dependencies external.
    noExternal: ["@morph/plugins"],
  },
});
