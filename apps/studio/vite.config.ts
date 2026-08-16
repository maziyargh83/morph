import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { routesDirectory, virtualRouteConfig } from "./routes.config.ts";
import { studioRouteTreeGenerator } from "./route-tree-generator.ts";

export default defineConfig({
  plugins: [
    devtools(),
    tanstackStart({
      router: {
        // All plugin-owned routes live below this package boundary.
        routesDirectory,
        generatedRouteTree: "./routeTree.gen.ts",
        virtualRouteConfig,
      },
    }),
    studioRouteTreeGenerator(),
    solid({ ssr: true }),
  ],
});
