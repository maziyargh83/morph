import { redirect } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { getRequestHeaders } from "@tanstack/solid-start/server";
import type { PageAccessDecision, PageHost } from "./page-access-client.ts";

const checkSsrPageAccess = createServerFn({ method: "POST" })
  .validator((input: { host: PageHost; path: string }) => {
    if (input.host !== "client" && input.host !== "studio") {
      throw new Error("Unknown Morph page host.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const requestHeaders = getRequestHeaders();
    const cookie = requestHeaders.get("cookie");
    const response = await fetch(
      `${process.env.MORPH_API_URL ?? "http://localhost:4000"}/graphql`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(cookie ? { cookie } : {}),
        },
        body: JSON.stringify({
          query: /* GraphQL */ `
            query SsrPageAccess($host: String!, $path: String!) {
              pageAccessDecision(host: $host, path: $path) {
                allowed
                reason
              }
            }
          `,
          variables: data,
        }),
      },
    );
    const payload = (await response.json()) as {
      data?: { pageAccessDecision: PageAccessDecision };
      errors?: Array<{ message: string }>;
    };

    if (!response.ok || payload.errors?.length || !payload.data) {
      throw new Error(
        payload.errors?.[0]?.message ?? "Could not check page access.",
      );
    }
    return payload.data.pageAccessDecision;
  });

export function createSsrPageAccessGuard(host: PageHost) {
  return async function requireSsrPageAccess(path: string) {
    const decision = await checkSsrPageAccess({ data: { host, path } });
    if (decision.allowed) return;

    throw redirect({
      to:
        decision.reason === "AUTHENTICATION_REQUIRED"
          ? "/auth/login"
          : "/auth/denied",
    });
  };
}
