import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const accessStatement = {
  ...defaultStatements,
  post: ["read", "read-draft", "create", "update", "delete"],
  pageAccess: ["read", "update"],
} as const;

export const accessControl = createAccessControl(accessStatement);

export const userRole = accessControl.newRole({
  post: ["read"],
});

export const editorRole = accessControl.newRole({
  post: ["read", "read-draft", "create", "update"],
});

export const adminRole = accessControl.newRole({
  ...adminAc.statements,
  post: ["read", "read-draft", "create", "update", "delete"],
  pageAccess: ["read", "update"],
});

export const accessRoles = {
  user: userRole,
  editor: editorRole,
  admin: adminRole,
};

export type AccessRole = keyof typeof accessRoles;

export function isAccessRole(value: string): value is AccessRole {
  return value in accessRoles;
}
