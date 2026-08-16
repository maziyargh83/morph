import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/profile/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <section class="panel">
      <p class="eyebrow">Profile plugin</p>
      <h1>Settings</h1>
      <p>Plugin routes can nest below a declarative mount point.</p>
    </section>
  );
}
