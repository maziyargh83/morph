import { fileURLToPath } from "node:url";
import { pluginCatalog } from "@morph/plugins";
import { createPluginRegistry, createPluginRouteConfig } from "@morph/router";

export const routesDirectory = fileURLToPath(
  new URL("./src/routes", import.meta.url),
);

export const pluginRegistry = createPluginRegistry("client", pluginCatalog);

export const virtualRouteConfig = createPluginRouteConfig({
  registry: pluginRegistry,
  rootFile: "__root.tsx",
  routesDirectory,
});
