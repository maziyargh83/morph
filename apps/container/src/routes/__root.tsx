import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/solid-router";
import type { MorphRouterContext } from "@morph/router/solid";

export const Route = createRootRouteWithContext<MorphRouterContext>()({
  component: RootLayout,
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

function RootLayout() {
  return (
    <div class="shell">
      <header class="header">
        <Link class="brand" to="/">
          morph<span>/client-csr</span>
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
      <footer>Vite CSR · four plugins · one generated tree</footer>
    </div>
  );
}
