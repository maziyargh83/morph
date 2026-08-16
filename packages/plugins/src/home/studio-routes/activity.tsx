import { createFileRoute } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";

const getServerSnapshot = createServerFn({ method: "GET" }).handler(
  async () => ({
    generatedAt: new Date().toISOString(),
    runtime: "TanStack Start server",
    region: process.env.DEPLOY_REGION ?? "local",
    requestId: crypto.randomUUID(),
  }),
);

export const Route = createFileRoute("/activity")({
  loader: () => getServerSnapshot(),
  head: () => ({ meta: [{ title: "Activity · Morph Studio" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const snapshot = Route.useLoaderData();

  return (
    <section class="page-section">
      <p class="eyebrow">SSR loader snapshot</p>
      <h1>Activity</h1>
      <p class="lede">
        This payload is produced by a server function, serialized into the
        initial response, and reused during hydration.
      </p>
      <dl class="detail-grid snapshot">
        <div>
          <dt>Generated at</dt>
          <dd>{snapshot().generatedAt}</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>{snapshot().runtime}</dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>{snapshot().region}</dd>
        </div>
        <div>
          <dt>Request ID</dt>
          <dd>{snapshot().requestId}</dd>
        </div>
      </dl>
    </section>
  );
}
