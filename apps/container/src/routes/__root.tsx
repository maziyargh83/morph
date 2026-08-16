import { Link, Outlet, createRootRoute } from "@tanstack/solid-router";

export const Route = createRootRoute({
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
          morph<span>/routes</span>
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
      <footer>Three plugins · one generated tree</footer>
    </div>
  );
}
