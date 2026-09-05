import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { routesDirectory, virtualRouteConfig } from "./routes.config.ts";
import { clientRouteTreeGenerator } from "./route-tree-generator.ts";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/graphql": "http://localhost:4000",
    },
  },
  plugins: [
    devtools(),
    tanstackStart({
      router: {
        routesDirectory,
        generatedRouteTree: "./routeTree.gen.ts",
        virtualRouteConfig,
      },
    }),
    clientRouteTreeGenerator(),
    solid({ ssr: true }),
  ],
});
