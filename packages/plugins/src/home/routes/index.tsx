import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <section class="hero">
      <p class="eyebrow">Plugin engine proof of concept</p>
      <h1>One route tree, independently owned routes.</h1>
      <p class="lede">
        This page comes from the root-mounted <code>home</code> plugin. Shop and
        profile own their files, while Morph performs a single TanStack Router
        generation pass.
      </p>
    </section>
  );
}
