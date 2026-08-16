import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/profile/")({ component: ProfilePage });

function ProfilePage() {
  return (
    <section class="panel">
      <p class="eyebrow">Namespaced plugin</p>
      <h1>Profile</h1>
      <p>This index route is physically located in the profile package.</p>
    </section>
  );
}
