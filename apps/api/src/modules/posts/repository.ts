import { desc, eq } from "drizzle-orm";
import type { MorphDatabase } from "../../database/client.ts";
import { post, type DatabasePost } from "../../database/schema.ts";

export type PostRecord = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: "published" | "draft";
  updatedAt: string;
  authorId: string | null;
};

export type CreatePostInput = {
  title: string;
  excerpt: string;
  body: string;
  authorId: string;
};

export interface PostRepository {
  list(options?: { includeDrafts?: boolean }): Promise<PostRecord[]>;
  findBySlug(slug: string): Promise<PostRecord | null>;
  create(input: CreatePostInput): Promise<PostRecord>;
}

export function createPostRepository(db: MorphDatabase): PostRepository {
  return {
    async list(options) {
      const rows = options?.includeDrafts
        ? await db.select().from(post).orderBy(desc(post.updatedAt))
        : await db
            .select()
            .from(post)
            .where(eq(post.status, "published"))
            .orderBy(desc(post.updatedAt));
      return rows.map(toPostRecord);
    },

    async findBySlug(slug) {
      const [row] = await db.select().from(post).where(eq(post.slug, slug));
      return row ? toPostRecord(row) : null;
    },

    async create(input) {
      const normalized = normalizeInput(input);
      const [row] = await db
        .insert(post)
        .values({
          ...normalized,
          slug: toSlug(normalized.title),
          status: "draft",
        })
        .returning();

      if (!row) throw new Error("The post could not be created.");
      return toPostRecord(row);
    },
  };
}

function normalizeInput(input: CreatePostInput): CreatePostInput {
  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const body = input.body.trim();

  if (!title || !excerpt || !body) {
    throw new Error("Title, excerpt, and body are required.");
  }

  return { title, excerpt, body, authorId: input.authorId };
}

function toPostRecord(row: DatabasePost): PostRecord {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
    authorId: row.authorId,
  };
}

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `post-${Date.now()}`;
}
