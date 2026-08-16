import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Generator,
  getConfig,
  type GeneratorEvent,
} from "@tanstack/router-generator";
import type { Plugin } from "vite";
import { routesDirectory, virtualRouteConfig } from "./routes.config.ts";

function createGenerator(root: string) {
  return new Generator({
    config: getConfig(
      {
        target: "solid",
        routesDirectory,
        generatedRouteTree: resolve(root, "src/routeTree.gen.ts"),
        virtualRouteConfig,
        routeTreeFileFooter: [
          "import type { getRouter } from './router.tsx'",
          "import type { createStart } from '@tanstack/solid-start'",
          "declare module '@tanstack/solid-router' {",
          "  interface Register {",
          "    router: Awaited<ReturnType<typeof getRouter>>",
          "  }",
          "}",
          "declare module '@tanstack/solid-start' {",
          "  interface Register {",
          "    ssr: true",
          "    router: Awaited<ReturnType<typeof getRouter>>",
          "  }",
          "}",
        ],
      },
      root,
    ),
    root,
  });
}

export async function generateStudioRouteTree(root: string) {
  await createGenerator(root).run();
}

/**
 * Keep the generated type tree exact after TanStack Start's environment passes.
 * Start still owns route crawling, code splitting, SSR, and its runtime manifest.
 */
export function studioRouteTreeGenerator(): Plugin {
  let generator: Generator | undefined;
  let queue = Promise.resolve();

  const generate = (event?: GeneratorEvent) => {
    if (!generator) return Promise.resolve();

    const task = queue.then(() => generator!.run(event));
    queue = task.catch(() => undefined);
    return task;
  };

  return {
    name: "morph:studio-route-tree-generator",
    enforce: "post",
    async configResolved(config) {
      generator = createGenerator(config.root);
    },
    async configureServer(server) {
      const onFileChange = (
        event: "add" | "change" | "unlink",
        path: string,
      ) => {
        if (!path.startsWith(routesDirectory)) return;

        const type =
          event === "add" ? "create" : event === "unlink" ? "delete" : "update";

        void generate({ type, path }).catch((error: unknown) => {
          server.config.logger.error(String(error));
        });
      };

      server.watcher.add(routesDirectory);
      server.watcher.on("all", onFileChange);
      await generate();

      return () => server.watcher.off("all", onFileChange);
    },
    async buildEnd() {
      await generate();
    },
  };
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === currentFile) {
  await generateStudioRouteTree(dirname(currentFile));
}
