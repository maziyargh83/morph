export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: "published" | "draft";
  updatedAt: string;
};
