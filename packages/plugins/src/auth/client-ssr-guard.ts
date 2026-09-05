import { createSsrPageAccessGuard } from "./ssr-guard.ts";

export const requireClientSsrPageAccess = createSsrPageAccessGuard("client");
