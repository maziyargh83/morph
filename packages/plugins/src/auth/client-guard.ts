import { redirect } from "@tanstack/solid-router";
import { checkPageAccess } from "./page-access-client.ts";

export async function requireClientPageAccess(path: string) {
  const decision = await checkPageAccess("client", path);
  if (decision.allowed) return;

  throw redirect({
    to:
      decision.reason === "AUTHENTICATION_REQUIRED"
        ? "/auth/login"
        : "/auth/denied",
  });
}
