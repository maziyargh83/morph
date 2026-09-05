export type MorphPageAccessGuard = (path: string) => void | Promise<void>;

export type MorphRouterContext = {
  morph: {
    requirePageAccess: MorphPageAccessGuard;
  };
};

export function createMorphRouterContext(
  requirePageAccess: MorphPageAccessGuard,
): MorphRouterContext {
  return { morph: { requirePageAccess } };
}

type MorphBeforeLoadContext = {
  context: Partial<MorphRouterContext>;
  routeId: string;
};

/**
 * Route middleware for plugin-owned pages. It derives the page key from the
 * generated route id, so route files never duplicate their path or auth logic.
 *
 * Keep TanStack's `createFileRoute` import: its generator owns that identifier.
 */
export async function morphPage({ context, routeId }: MorphBeforeLoadContext) {
  if (!context.morph?.requirePageAccess) {
    throw new Error(
      "Morph route access is not configured. Pass createMorphRouterContext() to createRouter().",
    );
  }

  await context.morph.requirePageAccess(normalizePagePath(routeId));
}

function normalizePagePath(path: string) {
  return path === "/" ? path : path.replace(/\/+$/, "");
}
