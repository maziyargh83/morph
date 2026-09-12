# Morph

Morph is a Solid monorepo where feature plugins contribute routes to multiple
rendering targets and share one database-backed GraphQL API.

## Applications

- `apps/container` — the public Vite CSR Client (`http://localhost:5173`)
- `apps/client-ssr` — the same public Client rendered by TanStack Start SSR
  (`http://localhost:5174`)
- `apps/studio` — the Solid Start Studio (`http://localhost:3001`)
- `apps/api` — GraphQL Yoga and Better Auth (`http://localhost:4000`)

The API uses plain GraphQL SDL and resolvers; there is no schema-builder
package. PostgreSQL access is type-safe through Drizzle ORM, and migrations are
generated into `apps/api/drizzle`.

## Plugins

`packages/plugins` owns the installed plugin catalog. Each plugin may expose a
different route tree to Client and Studio while keeping shared contracts in one
folder.

The auth plugin provides:

- Client sign-up, sign-in, account, and sign-out routes under `/auth`
- Studio sign-in and user/role management under `/auth`
- Better Auth sessions persisted in PostgreSQL
- `user`, `editor`, and `admin` roles with typed post permissions
- database-backed page policies managed from the Studio access screen

GraphQL reads the Better Auth session cookie. Public users can read published
posts; editors and admins can read drafts and create posts. The Client's shared
route loaders run in the browser for CSR and on the server for SSR. The Studio
user list and role changes require an admin session.

Each non-system page is declared by its owning plugin with a default access
mode. An admin can open Studio `/auth` and override it as public, available to
any authenticated user, or restricted to selected roles. Client guards run
before navigation, Studio guards run during SSR, and GraphQL remains the final
authorization boundary. Login, access management, and access-denied routes are
system routes and cannot be overridden, preventing accidental lockout.

### Protected plugin routes

Plugin pages use Morph's route middleware while keeping TanStack's constructor
so its file-route generator and type inference continue to work:

```tsx
import { createFileRoute } from "@tanstack/solid-router";
import { morphPage } from "@morph/router/solid";

export const Route = createFileRoute("/posts/new")({
  beforeLoad: morphPage,
  component: NewPost,
});
```

`morphPage` reads the generated route id, then delegates to the Client or Studio
access adapter supplied by that app's router context. Route files do not repeat
their path and do not import app-specific guards. System auth routes omit
`morphPage` deliberately.

## Client templates

The executable CSR and SSR apps are also the canonical templates, so template
code cannot drift away from the examples. Both consume the same `client`
plugin registry; installing a plugin changes both generated route trees without
editing either app.

Create another client interactively:

```sh
pnpm morph -- create
```

Or run it non-interactively:

```sh
pnpm morph -- create storefront --template ssr --port 5180
pnpm morph -- create dashboard --template csr --port 5181
```

The scaffolder refuses to overwrite an existing app and excludes generated
route trees, build output, dependencies, and caches.

## Local setup

```sh
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm db:migrate
pnpm db:seed
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='change-this-password' pnpm auth:create-admin
pnpm dev
```

The values in `.env` are loaded by the API scripts. Replace
`BETTER_AUTH_SECRET` before using a shared or production environment.

GraphiQL is available at `http://localhost:4000/graphql` in development. Both
Client variants and Studio proxy `/graphql` and `/api/auth` to the API, so auth
cookies stay same-origin in local development.

## Commands

```sh
pnpm check-types
pnpm test
pnpm build
pnpm morph -- create

pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:seed
pnpm auth:create-admin
```

Route trees are generated from the plugin catalog before type checks and
production builds. Generated TypeScript and SQL migrations are committed;
runtime build output is ignored.
