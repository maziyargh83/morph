import { createServerFn } from "@tanstack/solid-start";
import type { Post } from "./content.ts";

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    const data = await requestGraphQL<{ posts: Post[] }>(/* GraphQL */ `
      query PublishedPosts {
        posts(includeDrafts: false) {
          slug
          title
          excerpt
          body
          status
          updatedAt
        }
      }
    `);
    return data.posts;
  },
);

export const getPublishedPost = createServerFn({ method: "GET" })
  .validator((slug: string) => {
    if (!slug.trim()) throw new Error("A post slug is required.");
    return slug;
  })
  .handler(async ({ data: slug }) => {
    const data = await requestGraphQL<{ post: Post | null }>(
      /* GraphQL */ `
        query PublishedPost($slug: ID!) {
          post(slug: $slug) {
            slug
            title
            excerpt
            body
            status
            updatedAt
          }
        }
      `,
      { slug },
    );
    return data.post;
  });

async function requestGraphQL<TData>(
  query: string,
  variables?: Record<string, unknown>,
) {
  const response = await fetch(
    `${process.env.MORPH_API_URL ?? "http://localhost:4000"}/graphql`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
    },
  );
  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (!response.ok || payload.errors?.length || !payload.data) {
    throw new Error(
      payload.errors?.[0]?.message ?? "Could not load published posts.",
    );
  }
  return payload.data;
}
