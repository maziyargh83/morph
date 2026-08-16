export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: "published" | "draft";
  updatedAt: string;
};

export const publishedPosts: readonly Post[] = [
  {
    slug: "plugin-owned-routing",
    title: "Plugin-owned routing",
    excerpt: "How one plugin can contribute routes to multiple applications.",
    body: "The posts plugin owns both its public Client routes and its authoring Studio routes. Each application selects only its own contribution during route generation.",
    status: "published",
    updatedAt: "2026-08-17",
  },
  {
    slug: "server-functions-at-the-edge",
    title: "Server functions at the edge",
    excerpt: "Keeping privileged authoring logic outside the browser bundle.",
    body: "TanStack Start turns the authoring handlers into RPC endpoints. The browser receives a typed client stub while the implementation remains in the server output.",
    status: "published",
    updatedAt: "2026-08-14",
  },
];
