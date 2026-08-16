# Morph

A minimal Solid + TanStack Router proof of concept for aggregating routes owned
by independent plugins into one generated, type-safe application route tree.

The workspace contains two independent applications:

- `apps/container`: the existing Solid SPA route aggregator.
- `apps/studio`: a Solid TanStack Start application with its own virtual route
  tree, SSR document shell, and plugin registry.

## Architecture

```text
packages/plugins/src/index.ts
          │ package-owned plugin catalog
          ▼
packages/router
          │ select `client` contributions
          ▼
apps/container/routes.config.ts
          │ one TanStack Router plugin invocation
          ▼
apps/container/src/routeTree.gen.ts
```

Studio reads the same package catalog but selects a different contribution:

```text
packages/plugins/src/index.ts
          │ package-owned plugin catalog
          ▼
packages/router
          │ select `studio` contributions
          ▼
apps/studio/routes.config.ts
          ▼
apps/studio/src/routeTree.gen.ts
```

Each plugin can contribute separate route directories to one or both apps:

```ts
export const homePlugin = definePlugin({
  name: "home",
  apps: {
    client: {
      routes: {
        directory: new URL("./routes", import.meta.url),
        mount: "/",
      },
    },
    studio: {
      routes: {
        directory: new URL("./studio-routes", import.meta.url),
        mount: "/",
      },
    },
  },
});
```

A cross-app plugin keeps all of its concerns in one folder while exposing
separate application surfaces:

```text
packages/plugins/src/posts/
├── main.ts                 # client + studio manifest
├── content.ts              # shared, client-safe contracts and content
├── routes/                 # public Client routes
├── studio-routes/          # Studio authoring routes and server functions
└── server/                 # server-only authoring implementation
```

The `posts` example serves public reading routes at `/posts` in the Client and
an SSR authoring list plus a validated POST server function at `/posts/new` in
Studio.

Both applications import only the manifest catalog during build configuration.
The router projects either `client` or `studio` before route generation, so only
the selected physical route directory enters that application's route tree and
runtime bundle. Manifest imports do not import route components.

Use `mount: '/'` to merge a plugin's routes at the current level. Namespaced
mounts such as `/shop` keep the namespace in the URL. TanStack's generator
reports route conflicts during generation.

## Commands

```sh
pnpm install
pnpm dev
pnpm check-types
pnpm build
```

The Studio route tree is regenerated with TanStack's generator API during
development, before type checks, and after production builds. Plugin route
source remains inside `packages/plugins`; no generated trees are parsed or
merged after the fact.
