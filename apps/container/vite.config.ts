import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { virtualRouteConfig } from "./routes.config.ts";

export default defineConfig({
  plugins: [
    devtools(),
    tanstackRouter({
      target: "solid",
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      virtualRouteConfig,
    }),
    solid(),
  ],
});
