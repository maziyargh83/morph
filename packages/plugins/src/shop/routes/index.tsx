import { Link, createFileRoute } from "@tanstack/solid-router";
import { requireClientPageAccess } from "../../auth/client-guard.ts";

export const Route = createFileRoute("/shop/")({
  beforeLoad: () => requireClientPageAccess("/shop"),
  component: ShopPage,
});

function ShopPage() {
  return (
    <section class="panel">
      <p class="eyebrow">Namespaced plugin</p>
      <h1>Shop</h1>
      <p>The shop plugin is mounted under its own URL namespace.</p>
      <Link class="button" params={{ id: "42" }} to="/shop/product/$id">
        Open product 42
      </Link>
    </section>
  );
}
