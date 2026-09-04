import type { Post } from "./content.ts";

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

export async function listPosts(options?: { includeDrafts?: boolean }) {
  const data = await requestGraphQL<
    { posts: Post[] },
    { includeDrafts: boolean }
  >(
    /* GraphQL */ `
      query Posts($includeDrafts: Boolean!) {
        posts(includeDrafts: $includeDrafts) {
          slug
          title
          excerpt
          body
          status
          updatedAt
        }
      }
    `,
    { includeDrafts: options?.includeDrafts ?? false },
  );
  return data.posts;
}

export async function getPost(slug: string) {
  const data = await requestGraphQL<{ post: Post | null }, { slug: string }>(
    /* GraphQL */ `
      query Post($slug: ID!) {
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
}

export async function createPost(input: {
  title: string;
  excerpt: string;
  body: string;
}) {
  const data = await requestGraphQL<
    { createPost: Post },
    { input: { title: string; excerpt: string; body: string } }
  >(
    /* GraphQL */ `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          slug
          title
          excerpt
          body
          status
          updatedAt
        }
      }
    `,
    { input },
  );
  return data.createPost;
}

async function requestGraphQL<TData, TVariables>(
  query: string,
  variables: TVariables,
): Promise<TData> {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message ?? "GraphQL request failed.");
  }
  if (!payload.data) throw new Error("GraphQL returned no data.");
  return payload.data;
}
