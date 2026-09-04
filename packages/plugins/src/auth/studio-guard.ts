import { redirect } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { getRequestHeaders } from "@tanstack/solid-start/server";
import type { PageAccessDecision } from "./page-access-client.ts";

const checkStudioPageAccess = createServerFn({ method: "POST" })
  .validator((input: { path: string }) => input)
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
            query StudioPageAccess($path: String!) {
              pageAccessDecision(host: "studio", path: $path) {
                allowed
                reason
              }
            }
          `,
          variables: { path: data.path },
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

export async function requireStudioPageAccess(path: string) {
  const decision = await checkStudioPageAccess({ data: { path } });
  if (decision.allowed) return;

  throw redirect({
    to:
      decision.reason === "AUTHENTICATION_REQUIRED"
        ? "/auth/login"
        : "/auth/denied",
  });
}
