import { Link, createFileRoute } from "@tanstack/solid-router";

type SettingsTab = "general" | "members" | "integrations";

type SettingsSearch = {
  tab?: SettingsTab;
  preview?: boolean;
};

export const Route = createFileRoute("/settings")({
  validateSearch: (search: Record<string, unknown>): SettingsSearch => ({
    tab: isSettingsTab(search.tab) ? search.tab : "general",
    preview: search.preview === true || search.preview === "true",
  }),
  head: () => ({ meta: [{ title: "Settings · Morph Studio" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const search = Route.useSearch();
  const activeTab = () => search().tab ?? "general";

  return (
    <section class="page-section">
      <p class="eyebrow">Typed search params</p>
      <h1>Settings</h1>
      <div class="tabs" aria-label="Settings sections">
        {(["general", "members", "integrations"] as const).map((tab) => (
          <Link
            classList={{ active: activeTab() === tab }}
            to="/settings"
            search={(previous) => ({ ...previous, tab })}
          >
            {tab}
          </Link>
        ))}
      </div>
      <div class="panel settings-panel">
        <div>
          <span class="field-label">Selected section</span>
          <strong>{activeTab()}</strong>
        </div>
        <Link
          class="toggle"
          classList={{ active: search().preview === true }}
          to="/settings"
          search={(previous) => ({
            ...previous,
            preview: !previous.preview,
          })}
        >
          Preview mode: {search().preview ? "on" : "off"}
        </Link>
      </div>
    </section>
  );
}

function isSettingsTab(value: unknown): value is SettingsTab {
  return value === "general" || value === "members" || value === "integrations";
}
