import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { physical, rootRoute } from "@tanstack/virtual-file-routes";

export type MorphHost = "client" | "studio";

export interface PluginRoutes {
  /** Absolute path, file URL, or path relative to the aggregator's routesDirectory. */
  directory: string | URL;
  /** URL prefix. Use `/` to merge the routes at the root level. */
  mount?: `/${string}`;
}

export interface PluginApplication {
  routes?: PluginRoutes;
}

export type PluginApplications = Partial<Record<MorphHost, PluginApplication>>;

export interface MorphPlugin<
  TApplications extends PluginApplications = PluginApplications,
> {
  name: string;
  /** Contributions owned by this package, keyed by consuming application. */
  apps: TApplications;
}

export interface PluginCatalog<
  TPlugins extends readonly MorphPlugin[] = readonly MorphPlugin[],
> {
  plugins: TPlugins;
}

interface RegisteredPlugin extends PluginApplication {
  name: string;
}

export interface PluginRegistry<THost extends MorphHost = MorphHost> {
  host: THost;
  plugins: readonly RegisteredPlugin[];
}

export interface PluginRouteConfigOptions<THost extends MorphHost> {
  registry: PluginRegistry<THost>;
  rootFile: string | URL;
  routesDirectory: string;
}

export function definePlugin<const TPlugin extends MorphPlugin>(
  plugin: TPlugin,
): TPlugin {
  if (!plugin.name.trim()) {
    throw new Error("A plugin name cannot be empty");
  }

  const hosts = Object.keys(plugin.apps);
  if (hosts.length === 0) {
    throw new Error(
      `Plugin ${plugin.name} must contribute to at least one app`,
    );
  }
  assertKnownHosts(plugin.name, hosts);

  return plugin;
}

/** Define the package-owned list of installed plugin manifests. */
export function definePluginCatalog<
  const TPlugins extends readonly MorphPlugin[],
>(plugins: TPlugins): PluginCatalog<TPlugins> {
  assertUniquePluginNames(plugins);
  return { plugins };
}

/** Select only one app's contributions without importing its route modules. */
export function createPluginRegistry<const THost extends MorphHost>(
  host: THost,
  catalog: PluginCatalog,
): PluginRegistry<THost> {
  assertUniquePluginNames(catalog.plugins);

  const plugins = catalog.plugins.flatMap((plugin): RegisteredPlugin[] => {
    const application = plugin.apps[host];
    return application ? [{ name: plugin.name, ...application }] : [];
  });

  return { host, plugins };
}

/** Aggregate one host's plugin route directories into a virtual route tree. */
export function createPluginRouteConfig({
  registry,
  rootFile,
  routesDirectory,
}: PluginRouteConfigOptions<MorphHost>) {
  assertUniquePluginNames(registry.plugins);

  const children = registry.plugins
    .filter(
      (plugin): plugin is RegisteredPlugin & { routes: PluginRoutes } =>
        plugin.routes !== undefined,
    )
    .sort((left, right) => {
      const leftMount = normalizeMount(left.routes.mount);
      const rightMount = normalizeMount(right.routes.mount);

      // Concrete namespaces must precede root-merged physical trees.
      if (leftMount === "/" && rightMount !== "/") return 1;
      if (leftMount !== "/" && rightMount === "/") return -1;
      return left.name.localeCompare(right.name);
    })
    .map((plugin) => {
      const directory = toGeneratorPath(
        plugin.routes.directory,
        routesDirectory,
      );
      const mount = normalizeMount(plugin.routes.mount);

      return mount === "/" ? physical(directory) : physical(mount, directory);
    });

  return rootRoute(toGeneratorPath(rootFile, routesDirectory), children);
}

function assertKnownHosts(pluginName: string, hosts: string[]) {
  const knownHosts = new Set<MorphHost>(["client", "studio"]);
  for (const host of hosts) {
    if (!knownHosts.has(host as MorphHost)) {
      throw new Error(`Plugin ${pluginName} targets unknown app ${host}`);
    }
  }
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

function assertUniquePluginNames(plugins: readonly { name: string }[]) {
  const names = new Set<string>();

  for (const plugin of plugins) {
    if (names.has(plugin.name)) {
      throw new Error(`Duplicate plugin name: ${plugin.name}`);
    }
    names.add(plugin.name);
  }
}
