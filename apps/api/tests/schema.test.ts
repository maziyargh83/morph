import assert from "node:assert/strict";
import test from "node:test";
import { graphql } from "graphql";
import type { MorphSession } from "../src/auth.ts";
import type {
  PostRecord,
  PostRepository,
} from "../src/modules/posts/repository.ts";
import { createMorphSchema, type MorphGraphQLContext } from "../src/schema.ts";
import type { PageAccessRepository } from "../src/modules/page-access/repository.ts";

const records: PostRecord[] = [
  {
    slug: "published-post",
    title: "Published post",
    excerpt: "Visible to everyone.",
    body: "Public body",
    status: "published",
    updatedAt: "2026-09-04T00:00:00.000Z",
    authorId: null,
  },
];

const posts: PostRepository = {
  async list() {
    return records;
  },
  async findBySlug(slug) {
    return records.find((post) => post.slug === slug) ?? null;
  },
  async create(input) {
    const post: PostRecord = {
      ...input,
      slug: "graphql-contribution",
      status: "draft",
      updatedAt: "2026-09-04T00:00:00.000Z",
    };
    records.unshift(post);
    return post;
  },
};

const schema = createMorphSchema();

const pageAccess: PageAccessRepository = {
  async list() {
    return [];
  },
  async decide(_host, _path, session) {
    return session
      ? { allowed: true, reason: "ALLOWED" }
      : { allowed: false, reason: "AUTHENTICATION_REQUIRED" };
  },
  async set() {
    throw new Error("Not used in this test.");
  },
  async reset() {
    throw new Error("Not used in this test.");
  },
};

function context(session: MorphSession | null = null): MorphGraphQLContext {
  return {
    request: new Request("http://localhost/graphql"),
    posts,
    pageAccess,
    session,
  };
}

test("queries the health check and plugin-owned posts", async () => {
  const result = await graphql({
    schema,
    source: /* GraphQL */ `
      query {
        health
        posts {
          slug
          title
          status
        }
      }
    `,
    contextValue: context(),
  });

  assert.deepEqual(result.errors, undefined);
  assert.equal(result.data?.health, "ok");
  assert.ok(Array.isArray(result.data?.posts));
});

test("returns a page access decision for route guards", async () => {
  const result = await graphql({
    schema,
    source: /* GraphQL */ `
      query {
        pageAccessDecision(host: "client", path: "/profile") {
          allowed
          reason
        }
      }
    `,
    contextValue: context(),
  });

  assert.deepEqual(result.errors, undefined);
  const decision = result.data?.pageAccessDecision as {
    allowed: boolean;
    reason: string;
  };

  assert.deepEqual(
    { ...decision },
    {
      allowed: false,
      reason: "AUTHENTICATION_REQUIRED",
    },
  );
});

test("rejects post creation without an authenticated editor", async () => {
  const result = await graphql({
    schema,
    source: /* GraphQL */ `
      mutation {
        createPost(
          input: { title: "Private", excerpt: "No session", body: "Denied" }
        ) {
          slug
        }
      }
    `,
    contextValue: context(),
  });

  assert.equal(result.errors?.[0]?.extensions.code, "UNAUTHENTICATED");
  assert.equal(result.data, null);
});

test("creates a post for an editor", async () => {
  const result = await graphql({
    schema,
    source: /* GraphQL */ `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          slug
          title
          status
        }
      }
    `,
    variableValues: {
      input: {
        title: "GraphQL contribution",
        excerpt: "Created in the API schema test.",
        body: "The posts plugin owns this mutation.",
      },
    },
    contextValue: context({
      user: {
        id: "editor-id",
        name: "Editor",
        email: "editor@example.com",
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: "editor",
        banned: false,
        banReason: null,
        banExpires: null,
      },
      session: {
        id: "session-id",
        userId: "editor-id",
        token: "test-token",
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        impersonatedBy: null,
      },
    }),
  });

  assert.deepEqual(result.errors, undefined);
  assert.equal(
    (result.data?.createPost as { slug?: string } | undefined)?.slug,
    "graphql-contribution",
  );
  assert.equal(
    (result.data?.createPost as { title?: string } | undefined)?.title,
    "GraphQL contribution",
  );
  assert.equal(
    (result.data?.createPost as { status?: string } | undefined)?.status,
    "draft",
  );
});
