import { and, eq } from "drizzle-orm";
import { pluginPages } from "@morph/plugins";
import type { MorphSession } from "../../auth.ts";
import type { MorphDatabase } from "../../database/client.ts";
import {
  accessRoleValues,
  pageAccess,
  type AccessRole,
} from "../../database/schema.ts";

export type PageHost = "client" | "studio";
export type PageAccessMode = "public" | "authenticated" | "roles";

export type PageAccessRecord = {
  key: string;
  plugin: string;
  host: PageHost;
  path: string;
  label: string;
  mode: PageAccessMode;
  roles: AccessRole[];
  customized: boolean;
};

export type PageAccessDecision = {
  allowed: boolean;
  reason: "ALLOWED" | "AUTHENTICATION_REQUIRED" | "FORBIDDEN";
};

export interface PageAccessRepository {
  list(): Promise<PageAccessRecord[]>;
  decide(
    host: PageHost,
    path: string,
    session: MorphSession | null,
  ): Promise<PageAccessDecision>;
  set(input: {
    host: PageHost;
    path: string;
    mode: PageAccessMode;
    roles: AccessRole[];
    updatedBy: string;
  }): Promise<PageAccessRecord>;
  reset(host: PageHost, path: string): Promise<PageAccessRecord>;
}

export function createPageAccessRepository(
  db: MorphDatabase,
): PageAccessRepository {
  return {
    async list() {
      const overrides = await db.select().from(pageAccess);
      const overridesByKey = new Map(
        overrides.map((override) => [
          pageKey(override.host, override.path),
          override,
        ]),
      );

      return pluginPages.map((definition) =>
        mergePageAccess(
          definition,
          overridesByKey.get(pageKey(definition.host, definition.path)),
        ),
      );
    },

    async decide(host, path, session) {
      const definition = findDefinition(host, path);
      const [override] = await db
        .select()
        .from(pageAccess)
        .where(and(eq(pageAccess.host, host), eq(pageAccess.path, path)))
        .limit(1);
      const policy = mergePageAccess(definition, override);

      if (policy.mode === "public") return { allowed: true, reason: "ALLOWED" };
      if (!session) {
        return { allowed: false, reason: "AUTHENTICATION_REQUIRED" };
      }
      if (policy.mode === "authenticated") {
        return { allowed: true, reason: "ALLOWED" };
      }

      const userRoles = String(session.user.role ?? "user").split(",");
      return policy.roles.some((role) => userRoles.includes(role))
        ? { allowed: true, reason: "ALLOWED" }
        : { allowed: false, reason: "FORBIDDEN" };
    },

    async set(input) {
      const definition = findDefinition(input.host, input.path);
      validatePolicy(input.mode, input.roles);

      const [override] = await db
        .insert(pageAccess)
        .values({
          host: input.host,
          path: input.path,
          mode: input.mode,
          roles: input.mode === "roles" ? input.roles : [],
          updatedBy: input.updatedBy,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [pageAccess.host, pageAccess.path],
          set: {
            mode: input.mode,
            roles: input.mode === "roles" ? input.roles : [],
            updatedBy: input.updatedBy,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (!override) throw new Error("Page access could not be saved.");
      return mergePageAccess(definition, override);
    },

    async reset(host, path) {
      const definition = findDefinition(host, path);
      await db
        .delete(pageAccess)
        .where(and(eq(pageAccess.host, host), eq(pageAccess.path, path)));
      return mergePageAccess(definition);
    },
  };
}

function findDefinition(host: PageHost, path: string) {
  const definition = pluginPages.find(
    (page) => page.host === host && page.path === path,
  );
  if (!definition)
    throw new Error(`Unknown configurable page: ${host}:${path}`);
  return definition;
}

function mergePageAccess(
  definition: (typeof pluginPages)[number],
  override?: typeof pageAccess.$inferSelect,
): PageAccessRecord {
  const defaultRoles =
    definition.defaultAccess.mode === "roles"
      ? definition.defaultAccess.roles.filter(isAccessRole)
      : [];

  return {
    key: definition.key,
    plugin: definition.plugin,
    host: definition.host,
    path: definition.path,
    label: definition.label,
    mode: override?.mode ?? definition.defaultAccess.mode,
    roles: override?.roles ?? defaultRoles,
    customized: override !== undefined,
  };
}

function validatePolicy(mode: PageAccessMode, roles: AccessRole[]) {
  if (mode === "roles" && roles.length === 0) {
    throw new Error("Select at least one role for restricted access.");
  }
  if (!roles.every(isAccessRole)) throw new Error("Unknown access role.");
}

function isAccessRole(value: string): value is AccessRole {
  return accessRoleValues.some((role) => role === value);
}

function pageKey(host: PageHost, path: string) {
  return `${host}:${path}`;
}
