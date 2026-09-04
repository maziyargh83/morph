import { For, Show, createSignal, onMount } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import { authClient } from "../client.ts";
import type { AccessRole } from "../access.ts";

type ListedUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
};

export const Route = createFileRoute("/auth/")({
  head: () => ({ meta: [{ title: "Access · Morph Studio" }] }),
  component: AccessPage,
});

function AccessPage() {
  const [users, setUsers] = createSignal<ListedUser[]>([]);
  const [viewerRole, setViewerRole] = createSignal("user");
  const [loaded, setLoaded] = createSignal(false);
  const [error, setError] = createSignal<string>();

  const load = async () => {
    setError(undefined);
    const session = await authClient.getSession();
    const role = String(session.data?.user.role ?? "user");
    setViewerRole(role);

    if (!role.split(",").includes("admin")) {
      setLoaded(true);
      return;
    }

    const result = await authClient.admin.listUsers({
      query: { limit: 100, sortBy: "name", sortDirection: "asc" },
    });
    if (result.error) setError(result.error.message ?? "Could not load users.");
    else setUsers(result.data?.users ?? []);
    setLoaded(true);
  };

  onMount(load);

  const changeRole = async (userId: string, role: AccessRole) => {
    const result = await authClient.admin.setRole({ userId, role });
    if (result.error) {
      setError(result.error.message ?? "Could not update role.");
      return;
    }
    await load();
  };

  return (
    <section class="page-section">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Auth plugin · Studio contribution</p>
          <h1>Users & access</h1>
        </div>
      </div>

      <Show when={loaded()} fallback={<p>Loading access control…</p>}>
        <Show
          when={viewerRole().split(",").includes("admin")}
          fallback={
            <div class="editor-form">
              <p>An admin session is required to manage users.</p>
              <Link class="button" to="/auth/login">
                Sign in to Studio
              </Link>
            </div>
          }
        >
          <div class="project-list">
            <For each={users()}>
              {(user) => (
                <div class="project-row">
                  <span
                    class={`status status-${user.banned ? "draft" : "published"}`}
                  />
                  <span class="project-copy">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                  <label class="role-picker">
                    <span class="sr-only">Role for {user.name}</span>
                    <select
                      value={user.role ?? "user"}
                      onChange={(event) =>
                        changeRole(
                          user.id,
                          event.currentTarget.value as AccessRole,
                        )
                      }
                    >
                      <option value="user">user</option>
                      <option value="editor">editor</option>
                      <option value="admin">admin</option>
                    </select>
                  </label>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>

      <Show when={error()}>
        {(message) => <p class="notice error">{message()}</p>}
      </Show>
    </section>
  );
}
