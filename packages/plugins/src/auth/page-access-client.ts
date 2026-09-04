export type PageHost = "client" | "studio";
export type PageAccessMode = "public" | "authenticated" | "roles";
export type PageRole = "user" | "editor" | "admin";

export type PageAccess = {
  key: string;
  plugin: string;
  host: PageHost;
  path: string;
  label: string;
  mode: PageAccessMode;
  roles: PageRole[];
  customized: boolean;
};

export type PageAccessDecision = {
  allowed: boolean;
  reason: "ALLOWED" | "AUTHENTICATION_REQUIRED" | "FORBIDDEN";
};

const pageFields = /* GraphQL */ `
  key
  plugin
  host
  path
  label
  mode
  roles
  customized
`;

export async function listPageAccess() {
  const data = await requestGraphQL<{
    pageAccessCatalog: PageAccess[];
  }>(/* GraphQL */ `
      query PageAccessCatalog {
        pageAccessCatalog {
          ${pageFields}
        }
      }
    `);
  return data.pageAccessCatalog;
}

export async function checkPageAccess(host: PageHost, path: string) {
  const data = await requestGraphQL<{
    pageAccessDecision: PageAccessDecision;
  }>(
    /* GraphQL */ `
      query PageAccessDecision($host: String!, $path: String!) {
        pageAccessDecision(host: $host, path: $path) {
          allowed
          reason
        }
      }
    `,
    { host, path },
  );
  return data.pageAccessDecision;
}

export async function savePageAccess(input: {
  host: PageHost;
  path: string;
  mode: PageAccessMode;
  roles: PageRole[];
}) {
  const data = await requestGraphQL<{ setPageAccess: PageAccess }>(
    /* GraphQL */ `
      mutation SetPageAccess($input: SetPageAccessInput!) {
        setPageAccess(input: $input) {
          ${pageFields}
        }
      }
    `,
    { input },
  );
  return data.setPageAccess;
}

export async function resetPageAccess(host: PageHost, path: string) {
  const data = await requestGraphQL<{ resetPageAccess: PageAccess }>(
    /* GraphQL */ `
      mutation ResetPageAccess($host: String!, $path: String!) {
        resetPageAccess(host: $host, path: $path) {
          ${pageFields}
        }
      }
    `,
    { host, path },
  );
  return data.resetPageAccess;
}

async function requestGraphQL<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  const payload = (await response.json()) as {
    data?: TData;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || payload.errors?.length || !payload.data) {
    throw new Error(payload.errors?.[0]?.message ?? "GraphQL request failed.");
  }
  return payload.data;
}
