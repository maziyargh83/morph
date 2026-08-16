import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <section class="panel">
      <p class="eyebrow">Root-level merge</p>
      <h1>About this example</h1>
      <p>
        The home plugin is mounted at <code>/</code>, so this file becomes{" "}
        <code>/about</code> without a plugin-name segment.
      </p>
    </section>
  );
}
