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
import type {
  PageAccessMode,
  PageAccessRepository,
  PageHost,
} from "./modules/page-access/repository.ts";

export type MorphGraphQLContext = {
  request: Request;
  session: MorphSession | null;
  posts: PostRepository;
  pageAccess: PageAccessRepository;
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

      type PageAccess {
        key: ID!
        plugin: String!
        host: String!
        path: String!
        label: String!
        mode: String!
        roles: [String!]!
        customized: Boolean!
      }

      type PageAccessDecision {
        allowed: Boolean!
        reason: String!
      }

      input SetPageAccessInput {
        host: String!
        path: String!
        mode: String!
        roles: [String!]! = []
      }

      type Query {
        health: String!
        viewer: User
        posts(includeDrafts: Boolean = false): [Post!]!
        post(slug: ID!): Post
        pageAccessCatalog: [PageAccess!]!
        pageAccessDecision(host: String!, path: String!): PageAccessDecision!
      }

      type Mutation {
        createPost(input: CreatePostInput!): Post!
        setPageAccess(input: SetPageAccessInput!): PageAccess!
        resetPageAccess(host: String!, path: String!): PageAccess!
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
        pageAccessCatalog: async (_parent, _args, context) => {
          requirePageAccessPermission(context, "read");
          return context.pageAccess.list();
        },
        pageAccessDecision: async (
          _parent,
          { host, path }: { host: string; path: string },
          context,
        ) => context.pageAccess.decide(parseHost(host), path, context.session),
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
        setPageAccess: async (
          _parent,
          {
            input,
          }: {
            input: {
              host: string;
              path: string;
              mode: string;
              roles: string[];
            };
          },
          context,
        ) => {
          const session = requirePageAccessPermission(context, "update");
          return context.pageAccess.set({
            host: parseHost(input.host),
            path: input.path,
            mode: parseMode(input.mode),
            roles: parseRoles(input.roles),
            updatedBy: session.user.id,
          });
        },
        resetPageAccess: async (
          _parent,
          { host, path }: { host: string; path: string },
          context,
        ) => {
          requirePageAccessPermission(context, "update");
          return context.pageAccess.reset(parseHost(host), path);
        },
      },
      User: {
        role: (user: { role?: string | null }) => user.role ?? "user",
      },
    },
  });
}

type PostPermission = (typeof accessStatement.post)[number];
type PageAccessPermission = (typeof accessStatement.pageAccess)[number];

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

function requirePageAccessPermission(
  context: MorphGraphQLContext,
  permission: PageAccessPermission,
) {
  if (!context.session) {
    throw new GraphQLError("Authentication required.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const allowed = sessionRoles(context.session).some(
    (role) =>
      isAccessRole(role) &&
      accessRoles[role].authorize({ pageAccess: [permission] }).success,
  );
  if (!allowed) {
    throw new GraphQLError("Admin access is required.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return context.session;
}

function sessionRoles(session: MorphSession) {
  return String(session.user.role ?? "user").split(",");
}

function parseHost(value: string): PageHost {
  if (value === "client" || value === "studio") return value;
  throw badInput(`Unknown page host: ${value}`);
}

function parseMode(value: string): PageAccessMode {
  if (value === "public" || value === "authenticated" || value === "roles") {
    return value;
  }
  throw badInput(`Unknown page access mode: ${value}`);
}

function parseRoles(values: string[]) {
  const roles = values.filter(isAccessRole);
  if (roles.length !== values.length) throw badInput("Unknown access role.");
  return roles;
}

function badInput(message: string) {
  return new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}
