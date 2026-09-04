import { createDatabase } from "./client.ts";
import { post } from "./schema.ts";

const { db, pool } = createDatabase();

await db
  .insert(post)
  .values([
    {
      slug: "plugin-owned-routing",
      title: "Plugin-owned routing",
      excerpt: "How one plugin can contribute routes to multiple applications.",
      body: "The posts plugin owns both its public Client routes and its authoring Studio routes.",
      status: "published",
    },
    {
      slug: "graphql-api",
      title: "A typed GraphQL API",
      excerpt: "PostgreSQL, Drizzle and Yoga behind one schema.",
      body: "Morph now persists content and authentication data in PostgreSQL.",
      status: "published",
    },
  ])
  .onConflictDoNothing();

await pool.end();
