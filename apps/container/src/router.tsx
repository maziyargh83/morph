import { createRouter } from "@tanstack/solid-router";
import { routeTree } from "./routeTree.gen";
import { createMorphRouterContext } from "@morph/router/solid";
import { requireClientSsrPageAccess } from "@morph/plugins/auth/client-ssr-guard";

export function getRouter() {
  return createRouter({
    routeTree,
    context: createMorphRouterContext(requireClientSsrPageAccess),
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}
