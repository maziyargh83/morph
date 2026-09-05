import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/solid-router";
import type { MorphRouterContext } from "@morph/router/solid";
import { HydrationScript } from "solid-js/web";
import { TanStackDevtools } from "@tanstack/solid-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/solid-router-devtools";
import "../styles.css";

export const Route = createRootRouteWithContext<MorphRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Morph Client" },
    ],
  }),
  component: RootDocument,
  notFoundComponent: () => (
    <section class="panel">
      <p class="eyebrow">404</p>
      <h1>Route not found</h1>
      <Link class="button" to="/">
        Return home
      </Link>
    </section>
  ),
});

function RootDocument() {
  const router = useRouter();

  return (
    <html lang="en">
      <head>
        <HydrationScript />
        <HeadContent />
      </head>
      <body>
        <div class="shell">
          <header class="header">
            <Link class="brand" to="/">
              morph<span>/client</span>
            </Link>
            <nav aria-label="Primary navigation">
              <Link
                activeOptions={{ exact: true }}
                activeProps={{ class: "active" }}
                to="/"
              >
                Home
              </Link>
              <Link activeProps={{ class: "active" }} to="/about">
                About
              </Link>
              <Link activeProps={{ class: "active" }} to="/shop">
                Shop
              </Link>
              <Link activeProps={{ class: "active" }} to="/posts">
                Posts
              </Link>
              <Link activeProps={{ class: "active" }} to="/auth">
                Account
              </Link>
              <Link activeProps={{ class: "active" }} to="/auth/login">
                Login
              </Link>
              <Link activeProps={{ class: "active" }} to="/profile">
                Profile
              </Link>
              <Link activeProps={{ class: "active" }} to="/profile/settings">
                Settings
              </Link>
            </nav>
          </header>
          <main>
            <Outlet />
          </main>
          <footer>
            TanStack Start SSR · four plugins · one generated tree
          </footer>
        </div>
        <Scripts />
        <TanStackDevtools
          plugins={[
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel router={router} />,
            },
          ]}
        />
      </body>
    </html>
  );
}
