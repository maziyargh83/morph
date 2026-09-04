import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { accessControl, accessRoles } from "./access.ts";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac: accessControl,
      roles: accessRoles,
    }),
  ],
});
