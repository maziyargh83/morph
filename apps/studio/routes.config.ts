import { fileURLToPath } from "node:url";
import { pluginCatalog, pluginRoutesDirectory } from "@morph/plugins";
import { createPluginRegistry, createPluginRouteConfig } from "@morph/router";

export const routesDirectory = fileURLToPath(pluginRoutesDirectory);

export const pluginRegistry = createPluginRegistry("studio", pluginCatalog);

export const virtualRouteConfig = createPluginRouteConfig({
  registry: pluginRegistry,
  rootFile: new URL("./src/routes/__root.tsx", import.meta.url),
  routesDirectory,
});
