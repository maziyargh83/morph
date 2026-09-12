#!/usr/bin/env -S node --experimental-strip-types

import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { scaffoldClient } from "./scaffold.ts";
import {
  clientTemplates,
  isClientTemplateId,
  type ClientTemplateId,
} from "./templates.ts";

let args: ReturnType<typeof parseArgs>;

try {
  args = parseArgs(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`create-morph: ${message}\n`);
  process.exit(1);
}

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.list) {
  printTemplates();
  process.exit(0);
}

const terminal = createInterface({ input: stdin, output: stdout });

try {
  const name =
    args.name ?? (await terminal.question("Client app name (my-client): "));
  const template = args.template ?? (await askTemplate());
  const defaultPort = clientTemplates[template].defaultPort;
  const portAnswer =
    args.port ??
    (await terminal.question(`Dev port (${String(defaultPort)}): `));
  const port = portAnswer ? Number(portAnswer) : defaultPort;

  const result = await scaffoldClient({
    name: name || "my-client",
    template,
    port,
    appsDirectory: resolve(process.cwd(), "apps"),
  });

  stdout.write(
    [
      "",
      `Created ${clientTemplates[result.template].label} at ${result.destination}`,
      "",
      "Next:",
      "  pnpm install",
      `  pnpm --filter ${result.packageName} dev`,
      "",
    ].join("\n"),
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`create-morph: ${message}\n`);
  process.exitCode = 1;
} finally {
  terminal.close();
}

async function askTemplate(): Promise<ClientTemplateId> {
  stdout.write("\nClient rendering:\n");
  stdout.write("  1) SSR — TanStack Start\n");
  stdout.write("  2) CSR — Vite + Solid Router\n");
  const answer = await terminal.question("Choose (1): ");
  return answer.trim() === "2" ? "csr" : "ssr";
}

function parseArgs(argv: string[]) {
  const result: {
    name?: string;
    template?: ClientTemplateId;
    port?: string;
    help: boolean;
    list: boolean;
  } = { help: false, list: false };
  let commandSeen = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") continue;
    if (arg === "create" && !commandSeen) {
      commandSeen = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") result.help = true;
    else if (arg === "--list") result.list = true;
    else if (arg === "--name") result.name = requireValue(argv, ++index, arg);
    else if (arg === "--port") result.port = requireValue(argv, ++index, arg);
    else if (arg === "--template") {
      const value = requireValue(argv, ++index, arg);
      if (!isClientTemplateId(value)) {
        throw new Error(`Unknown template: ${value}`);
      }
      result.template = value;
    } else if (!arg?.startsWith("-") && !result.name) {
      result.name = arg;
    } else {
      throw new Error(`Unknown option: ${String(arg)}`);
    }
  }
  return result;
}

function requireValue(argv: string[], index: number, option: string) {
  const value = argv[index];
  if (!value) throw new Error(`${option} requires a value.`);
  return value;
}

function printTemplates() {
  for (const template of Object.values(clientTemplates)) {
    stdout.write(
      `${template.id}\t${template.label}\t${template.description}\n`,
    );
  }
}

function printHelp() {
  stdout.write(`Usage: morph create [name] [options]\n\n`);
  stdout.write(`  --name <name>          app directory and package name\n`);
  stdout.write(`  --template <csr|ssr>   client rendering template\n`);
  stdout.write(`  --port <number>        development server port\n`);
  stdout.write(`  --list                 list available templates\n`);
  stdout.write(`  --help                 show this help\n`);
}
