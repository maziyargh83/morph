import { Link, createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/auth/denied")({
  head: () => ({ meta: [{ title: "Access denied · Morph Studio" }] }),
  component: AccessDenied,
});

function AccessDenied() {
  return (
    <section class="page-section">
      <p class="eyebrow">403 · Access denied</p>
      <h1>You cannot open this page</h1>
      <p>Your account does not have one of the roles allowed by its policy.</p>
      <Link class="button" to="/auth">
        Open access management
      </Link>
    </section>
  );
}
