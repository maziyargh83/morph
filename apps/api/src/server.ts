import { createServer } from "node:http";
import { toNodeHandler } from "better-auth/node";
import { createApi } from "./app.ts";
import { createAuth } from "./auth.ts";
import { createDatabase } from "./database/client.ts";
import { createPostRepository } from "./modules/posts/repository.ts";
import { createPageAccessRepository } from "./modules/page-access/repository.ts";

const port = parsePort(process.env.PORT);
const { db, pool } = createDatabase();
const auth = createAuth(db);
const authHandler = toNodeHandler(auth);
const yoga = createApi({
  auth,
  posts: createPostRepository(db),
  pageAccess: createPageAccessRepository(db),
});
const server = createServer((request, response) => {
  if (request.url?.startsWith("/api/auth")) {
    return authHandler(request, response);
  }

  return yoga(request, response);
});

server.listen(port, () => {
  console.log(
    `Morph GraphQL API is running at http://localhost:${port}/graphql`,
  );
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    server.close(async (error) => {
      await pool.end();
      if (error) {
        console.error(error);
        process.exitCode = 1;
      }
    });
  });
}

function parsePort(value: string | undefined) {
  if (value === undefined) return 4000;

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}
