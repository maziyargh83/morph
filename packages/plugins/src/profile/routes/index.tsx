import { createFileRoute } from "@tanstack/solid-router";
import { requireClientPageAccess } from "../../auth/client-guard.ts";

export const Route = createFileRoute("/profile/")({
  beforeLoad: () => requireClientPageAccess("/profile"),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <section class="panel">
      <p class="eyebrow">Namespaced plugin</p>
      <h1>Profile</h1>
      <p>This index route is physically located in the profile package.</p>
    </section>
  );
}
