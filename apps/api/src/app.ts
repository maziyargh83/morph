import { createYoga } from "graphql-yoga";
import type { MorphAuth } from "./auth.ts";
import type { MorphSession } from "./auth.ts";
import type { PostRepository } from "./modules/posts/repository.ts";
import { createMorphSchema, type MorphGraphQLContext } from "./schema.ts";

const developmentOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

export function createApi(options: { auth: MorphAuth; posts: PostRepository }) {
  const configuredOrigins = process.env.TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return createYoga<{}, MorphGraphQLContext>({
    schema: createMorphSchema(),
    graphqlEndpoint: "/graphql",
    graphiql: process.env.NODE_ENV !== "production",
    cors: {
      origin:
        configuredOrigins && configuredOrigins.length > 0
          ? configuredOrigins
          : developmentOrigins,
      credentials: true,
    },
    context: async ({ request }) => ({
      request,
      posts: options.posts,
      session: (await options.auth.api.getSession({
        headers: request.headers,
      })) as MorphSession | null,
    }),
  });
}
