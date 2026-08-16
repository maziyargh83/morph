import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { physical, rootRoute } from "@tanstack/virtual-file-routes";

export interface PluginRoutes {
  /** Absolute path, file URL, or path relative to the aggregator's routesDirectory. */
  directory: string | URL;
  /** URL prefix. Use `/` to merge the routes at the root level. */
  mount?: `/${string}`;
}

export interface MorphPlugin {
  name: string;
  routes?: PluginRoutes;
}

export interface PluginRouteConfigOptions {
  plugins: readonly MorphPlugin[];
  rootFile: string;
  routesDirectory: string;
}

export function definePlugin<const TPlugin extends MorphPlugin>(
  plugin: TPlugin,
): TPlugin {
  if (!plugin.name.trim()) {
    throw new Error("A plugin name cannot be empty");
  }

  return plugin;
}

/** Aggregate plugin directories into one TanStack virtual route tree. */
export function createPluginRouteConfig({
  plugins,
  rootFile,
  routesDirectory,
}: PluginRouteConfigOptions) {
  assertUniquePluginNames(plugins);

  const children = plugins
    .filter(
      (plugin): plugin is MorphPlugin & { routes: PluginRoutes } =>
        plugin.routes !== undefined,
    )
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((plugin) => {
      const directory = toGeneratorPath(
        plugin.routes.directory,
        routesDirectory,
      );
      const mount = normalizeMount(plugin.routes.mount);

      return mount === "/" ? physical(directory) : physical(mount, directory);
    });

  return rootRoute(rootFile, children);
}

function normalizeMount(mount: PluginRoutes["mount"]): `/${string}` {
  if (!mount || mount === "/") return "/";
  return `/${mount.replace(/^\/+|\/+$/g, "")}`;
}

function toGeneratorPath(directory: string | URL, routesDirectory: string) {
  const physicalDirectory =
    directory instanceof URL
      ? fileURLToPath(directory)
      : isAbsolute(directory)
        ? directory
        : resolve(routesDirectory, directory);

  return relative(routesDirectory, physicalDirectory).split(sep).join("/");
}

function assertUniquePluginNames(plugins: readonly MorphPlugin[]) {
  const names = new Set<string>();

  for (const plugin of plugins) {
    if (names.has(plugin.name)) {
      throw new Error(`Duplicate plugin name: ${plugin.name}`);
    }
    names.add(plugin.name);
  }
}
