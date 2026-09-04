import { createFileRoute } from "@tanstack/solid-router";
import { requireClientPageAccess } from "../../auth/client-guard.ts";

export const Route = createFileRoute("/profile/settings")({
  beforeLoad: () => requireClientPageAccess("/profile/settings"),
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
