import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useRouter,
} from "@tanstack/solid-router";
import { HydrationScript } from "solid-js/web";
import "../styles.css";
import { TanStackDevtools } from "@tanstack/solid-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/solid-router-devtools";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Morph Studio" },
    ],
  }),
  component: RootDocument,
  notFoundComponent: () => (
    <section class="panel">
      <p class="eyebrow">404</p>
      <h1>That Studio route does not exist.</h1>
      <Link class="button" to="/">
        Back to Studio
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
              morph<span>/studio</span>
            </Link>
            <nav aria-label="Studio navigation">
              <Link
                activeOptions={{ exact: true }}
                activeProps={{ class: "active" }}
                to="/"
              >
                Overview
              </Link>
              <Link activeProps={{ class: "active" }} to="/projects">
                Projects
              </Link>
              <Link activeProps={{ class: "active" }} to="/activity">
                Activity
              </Link>
              <Link activeProps={{ class: "active" }} to="/posts">
                Posts
              </Link>
              <Link activeProps={{ class: "active" }} to="/settings">
                Settings
              </Link>
            </nav>
          </header>
          <main>
            <Outlet />
          </main>
          <footer>Independent TanStack Start app · virtual route tree</footer>
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
