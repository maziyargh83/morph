import { createFileRoute } from "@tanstack/solid-router";
import { morphPage } from "@morph/router/solid";

export const Route = createFileRoute("/shop/product/$id")({
  beforeLoad: morphPage,
  component: ProductPage,
});

function ProductPage() {
  const params = Route.useParams();
  return (
    <section class="panel">
      <p class="eyebrow">Dynamic plugin route</p>
      <h1>Product {params().id}</h1>
      <p>This parameter is typed from the single generated application tree.</p>
    </section>
  );
}
