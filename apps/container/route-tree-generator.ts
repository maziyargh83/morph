import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Generator, getConfig } from "@tanstack/router-generator";
import { routesDirectory, virtualRouteConfig } from "./routes.config.ts";

const currentFile = fileURLToPath(import.meta.url);
const root = dirname(currentFile);

const generator = new Generator({
  config: getConfig(
    {
      target: "solid",
      routesDirectory,
      generatedRouteTree: resolve(root, "src/routeTree.gen.ts"),
      virtualRouteConfig,
    },
    root,
  ),
  root,
});

await generator.run();
