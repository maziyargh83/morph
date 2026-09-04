import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { accessControl, accessRoles } from "@morph/plugins/auth/access";
import type { MorphDatabase } from "./database/client.ts";
import * as schema from "./database/schema.ts";

const developmentOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

export function createAuth(db: MorphDatabase) {
  return betterAuth({
    appName: "Morph",
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
    secret: getAuthSecret(),
    trustedOrigins: configuredOrigins(),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      admin({
        ac: accessControl,
        roles: accessRoles,
        defaultRole: "user",
      }),
    ],
  });
}

export type MorphAuth = ReturnType<typeof createAuth>;
type InferredSession = MorphAuth["$Infer"]["Session"];
export type MorphSession = Omit<InferredSession, "user" | "session"> & {
  user: InferredSession["user"] & {
    role: string;
    banned: boolean;
    banReason: string | null;
    banExpires: Date | null;
  };
  session: InferredSession["session"] & {
    impersonatedBy: string | null;
  };
};

function configuredOrigins() {
  const value = process.env.TRUSTED_ORIGINS;
  return value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : developmentOrigins;
}

function getAuthSecret() {
  const value = process.env.BETTER_AUTH_SECRET;
  if (value) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET is required in production.");
  }

  return "morph-development-secret-change-me-000000";
}
