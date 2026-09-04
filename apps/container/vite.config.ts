import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { routesDirectory, virtualRouteConfig } from "./routes.config.ts";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/graphql": "http://localhost:4000",
    },
  },
  plugins: [
    devtools(),
    tanstackRouter({
      target: "solid",
      routesDirectory,
      generatedRouteTree: "./src/routeTree.gen.ts",
      virtualRouteConfig,
    }),
    solid(),
  ],
});
