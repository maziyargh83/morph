import { fileURLToPath } from "node:url";

export type ClientTemplateId = "csr" | "ssr";

export type ClientTemplate = {
  id: ClientTemplateId;
  label: string;
  description: string;
  sourceDirectory: string;
  defaultPort: number;
};

export const clientTemplates: Record<ClientTemplateId, ClientTemplate> = {
  csr: {
    id: "csr",
    label: "Client CSR",
    description: "Vite + Solid Router browser-rendered client",
    sourceDirectory: fileURLToPath(
      new URL("../../../apps/container", import.meta.url),
    ),
    defaultPort: 5173,
  },
  ssr: {
    id: "ssr",
    label: "Client SSR",
    description: "TanStack Start server-rendered and hydrated client",
    sourceDirectory: fileURLToPath(
      new URL("../../../apps/client-ssr", import.meta.url),
    ),
    defaultPort: 5174,
  },
};

export function isClientTemplateId(value: string): value is ClientTemplateId {
  return value === "csr" || value === "ssr";
}
