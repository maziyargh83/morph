import { Link, createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Overview · Morph Studio" }] }),
  component: StudioOverview,
});

function StudioOverview() {
  return (
    <div class="stack">
      <section class="hero">
        <p class="eyebrow">Morph Studio</p>
        <h1>Build and shape your workspace.</h1>
        <p class="lede">
          These pages are owned by the <code>home</code> plugin package and
          assembled into the Studio app through its virtual route tree.
        </p>
      </section>

      <section class="feature-grid" aria-label="TanStack Start examples">
        <FeatureCard
          eyebrow="Server loader"
          title="Projects"
          description="Load typed project data through a Start server function."
          to="/projects"
        />
        <FeatureCard
          eyebrow="SSR data"
          title="Activity"
          description="Inspect a snapshot produced only by the server runtime."
          to="/activity"
        />
        <FeatureCard
          eyebrow="URL state"
          title="Settings"
          description="Drive a typed view directly from validated search params."
          to="/settings"
        />
        <FeatureCard
          eyebrow="Cross-app plugin"
          title="Posts"
          description="Author in Studio while the same plugin serves public Client routes."
          to="/posts"
        />
      </section>
    </div>
  );
}

function FeatureCard(props: {
  eyebrow: string;
  title: string;
  description: string;
  to: "/projects" | "/activity" | "/settings" | "/posts";
}) {
  return (
    <Link class="feature-card" to={props.to}>
      <span>{props.eyebrow}</span>
      <strong>{props.title}</strong>
      <p>{props.description}</p>
      <b aria-hidden="true">Explore →</b>
    </Link>
  );
}
