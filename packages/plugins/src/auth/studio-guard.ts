import { createSsrPageAccessGuard } from "./ssr-guard.ts";

export const requireStudioPageAccess = createSsrPageAccessGuard("studio");
