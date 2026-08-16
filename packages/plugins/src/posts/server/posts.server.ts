import { publishedPosts, type Post } from "../content.ts";

export type CreatePostInput = {
  title: string;
  excerpt: string;
  body: string;
};

const drafts: Post[] = [
  {
    slug: "studio-authoring-workflow",
    title: "Studio authoring workflow",
    excerpt: "A draft created and managed from the Studio contribution.",
    body: "This draft lives behind a TanStack Start server function.",
    status: "draft",
    updatedAt: "Just now",
  },
];

export function listStudioPosts(): Post[] {
  return [...drafts, ...publishedPosts];
}

export function createStudioPost(input: CreatePostInput): Post {
  const post: Post = {
    slug: toSlug(input.title),
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    status: "draft",
    updatedAt: "Just now",
  };

  drafts.unshift(post);
  return post;
}

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `post-${Date.now()}`;
}
