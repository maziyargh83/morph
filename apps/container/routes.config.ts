import { fileURLToPath } from "node:url";
import { plugins } from "@morph/plugins";
import { createPluginRouteConfig } from "@morph/router";

export const routesDirectory = fileURLToPath(
  new URL("./src/routes", import.meta.url)
);

export const virtualRouteConfig = createPluginRouteConfig({
  plugins,
  rootFile: "__root.tsx",
  routesDirectory,
});
