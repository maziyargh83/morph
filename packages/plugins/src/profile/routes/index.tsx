import { createFileRoute } from "@tanstack/solid-router";
import { morphPage } from "@morph/router/solid";

export const Route = createFileRoute("/profile/")({
  beforeLoad: morphPage,
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
