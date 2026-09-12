import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";
import { clientTemplates, type ClientTemplateId } from "./templates.ts";

export type ScaffoldClientOptions = {
  name: string;
  template: ClientTemplateId;
  appsDirectory: string;
  port?: number;
};

export type ScaffoldClientResult = {
  destination: string;
  packageName: string;
  template: ClientTemplateId;
  port: number;
};

const ignoredNames = new Set(["dist", "node_modules", ".turbo"]);

export async function scaffoldClient(
  options: ScaffoldClientOptions,
): Promise<ScaffoldClientResult> {
  const name = validateAppName(options.name);
  const template = clientTemplates[options.template];
  const appsDirectory = resolve(options.appsDirectory);
  const destination = resolve(appsDirectory, name);
  const relativeDestination = relative(appsDirectory, destination);

  if (
    !relativeDestination ||
    relativeDestination.startsWith("..") ||
    relativeDestination.includes("/")
  ) {
    throw new Error("Client destination must be one direct child of apps/.");
  }
  if (await exists(destination)) {
    throw new Error(`Destination already exists: ${destination}`);
  }

  await mkdir(appsDirectory, { recursive: true });
  await cp(template.sourceDirectory, destination, {
    recursive: true,
    filter: (source) => shouldCopy(source),
  });

  const port = validatePort(options.port ?? template.defaultPort);
  const packagePath = join(destination, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as {
    name: string;
    scripts: Record<string, string>;
  };
  const packageName = `@morph/${name}`;
  packageJson.name = packageName;
  packageJson.scripts.dev =
    options.template === "ssr"
      ? `vite dev --port ${port}`
      : `vite --port ${port}`;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  if (options.template === "ssr") {
    await makeSsrStylesSelfContained(destination);
  }

  return { destination, packageName, template: options.template, port };
}

export function validateAppName(value: string) {
  const name = value.trim();
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    throw new Error(
      "App name must start with a letter and contain lowercase letters, numbers, or dashes.",
    );
  }
  return name;
}

function validatePort(port: number) {
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("Port must be an integer between 1 and 65535.");
  }
  return port;
}

function shouldCopy(source: string) {
  const name = basename(source);
  return !ignoredNames.has(name) && name !== "routeTree.gen.ts";
}

async function makeSsrStylesSelfContained(destination: string) {
  const sharedStyles = new URL(
    "../../../apps/container/src/styles.css",
    import.meta.url,
  );
  await cp(sharedStyles, join(destination, "src/styles.css"));

  const rootPath = join(destination, "src/routes/__root.tsx");
  const root = await readFile(rootPath, "utf8");
  await writeFile(
    rootPath,
    root.replace(
      'import "../../../container/src/styles.css";',
      'import "../styles.css";',
    ),
  );
}

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
