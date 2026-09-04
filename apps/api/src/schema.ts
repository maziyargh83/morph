import { GraphQLError } from "graphql";
import { createSchema } from "graphql-yoga";
import {
  accessRoles,
  accessStatement,
  isAccessRole,
} from "@morph/plugins/auth/access";
import type { MorphSession } from "./auth.ts";
import type {
  CreatePostInput,
  PostRepository,
  PostRecord,
} from "./modules/posts/repository.ts";

export type MorphGraphQLContext = {
  request: Request;
  session: MorphSession | null;
  posts: PostRepository;
};

export function createMorphSchema() {
  return createSchema<MorphGraphQLContext>({
    typeDefs: /* GraphQL */ `
      type User {
        id: ID!
        name: String!
        email: String!
        role: String!
      }

      type Post {
        slug: ID!
        title: String!
        excerpt: String!
        body: String!
        status: String!
        updatedAt: String!
        authorId: ID
      }

      input CreatePostInput {
        title: String!
        excerpt: String!
        body: String!
      }

      type Query {
        health: String!
        viewer: User
        posts(includeDrafts: Boolean = false): [Post!]!
        post(slug: ID!): Post
      }

      type Mutation {
        createPost(input: CreatePostInput!): Post!
      }
    `,
    resolvers: {
      Query: {
        health: () => "ok",
        viewer: (_parent, _args, context) => context.session?.user ?? null,
        posts: async (
          _parent,
          { includeDrafts }: { includeDrafts?: boolean },
          context,
        ) => {
          if (includeDrafts) requirePermission(context, "read-draft");
          return context.posts.list({ includeDrafts });
        },
        post: async (_parent, { slug }: { slug: string }, context) => {
          const result = await context.posts.findBySlug(slug);
          if (
            result?.status === "draft" &&
            !hasPermission(context, "read-draft")
          ) {
            return null;
          }
          return result;
        },
      },
      Mutation: {
        createPost: async (
          _parent,
          { input }: { input: Omit<CreatePostInput, "authorId"> },
          context,
        ): Promise<PostRecord> => {
          const session = requirePermission(context, "create");
          return context.posts.create({ ...input, authorId: session.user.id });
        },
      },
      User: {
        role: (user: { role?: string | null }) => user.role ?? "user",
      },
    },
  });
}

type PostPermission = (typeof accessStatement.post)[number];

function hasPermission(
  context: MorphGraphQLContext,
  permission: PostPermission,
) {
  const roles = String(context.session?.user.role ?? "user").split(",");
  return roles.some(
    (role) =>
      isAccessRole(role) &&
      accessRoles[role].authorize({ post: [permission] }).success,
  );
}

function requirePermission(
  context: MorphGraphQLContext,
  permission: PostPermission,
): MorphSession {
  if (!context.session) {
    throw new GraphQLError("Authentication required.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (!hasPermission(context, permission)) {
    throw new GraphQLError("You do not have permission for this operation.", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return context.session;
}
