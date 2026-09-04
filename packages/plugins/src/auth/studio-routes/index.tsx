import { For, Show, createSignal, onMount } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import { authClient } from "../client.ts";
import type { AccessRole } from "../access.ts";
import {
  listPageAccess,
  resetPageAccess,
  savePageAccess,
  type PageAccess,
  type PageAccessMode,
  type PageRole,
} from "../page-access-client.ts";

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
  const [pages, setPages] = createSignal<PageAccess[]>([]);
  const [viewerRole, setViewerRole] = createSignal("user");
  const [loaded, setLoaded] = createSignal(false);
  const [error, setError] = createSignal<string>();
  const [savingPage, setSavingPage] = createSignal<string>();

  const load = async () => {
    setError(undefined);
    const session = await authClient.getSession();
    const role = String(session.data?.user.role ?? "user");
    setViewerRole(role);

    if (!role.split(",").includes("admin")) {
      setLoaded(true);
      return;
    }

    try {
      const [usersResult, pageResult] = await Promise.all([
        authClient.admin.listUsers({
          query: { limit: 100, sortBy: "name", sortDirection: "asc" },
        }),
        listPageAccess(),
      ]);
      if (usersResult.error) {
        setError(usersResult.error.message ?? "Could not load users.");
      } else {
        setUsers(usersResult.data?.users ?? []);
      }
      setPages(pageResult);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load access data.",
      );
    } finally {
      setLoaded(true);
    }
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

  const updatePage = (key: string, patch: Partial<PageAccess>) => {
    setPages((current) =>
      current.map((page) => (page.key === key ? { ...page, ...patch } : page)),
    );
  };

  const togglePageRole = (
    page: PageAccess,
    role: PageRole,
    checked: boolean,
  ) => {
    const roles = checked
      ? [...new Set([...page.roles, role])]
      : page.roles.filter((current) => current !== role);
    updatePage(page.key, { roles });
  };

  const savePolicy = async (page: PageAccess) => {
    setError(undefined);
    setSavingPage(page.key);
    try {
      const saved = await savePageAccess({
        host: page.host,
        path: page.path,
        mode: page.mode,
        roles: page.mode === "roles" ? page.roles : [],
      });
      updatePage(page.key, saved);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save page access.",
      );
    } finally {
      setSavingPage(undefined);
    }
  };

  const resetPolicy = async (page: PageAccess) => {
    setError(undefined);
    setSavingPage(page.key);
    try {
      updatePage(page.key, await resetPageAccess(page.host, page.path));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not reset page access.",
      );
    } finally {
      setSavingPage(undefined);
    }
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

          <section class="access-section">
            <div>
              <p class="eyebrow">Plugin page catalog</p>
              <h2>Page policies</h2>
              <p>
                Override the access declared by each plugin. Auth system pages
                are intentionally excluded to prevent lockout.
              </p>
            </div>

            <div class="access-grid">
              <For each={pages()}>
                {(page) => (
                  <article class="access-card">
                    <header>
                      <div>
                        <strong>{page.label}</strong>
                        <code>{page.path}</code>
                      </div>
                      <span class="access-source">
                        {page.host} · {page.plugin}
                      </span>
                    </header>

                    <label>
                      <span>Access mode</span>
                      <select
                        value={page.mode}
                        onChange={(event) =>
                          updatePage(page.key, {
                            mode: event.currentTarget.value as PageAccessMode,
                          })
                        }
                      >
                        <option value="public">Public</option>
                        <option value="authenticated">
                          Any signed-in user
                        </option>
                        <option value="roles">Selected roles</option>
                      </select>
                    </label>

                    <Show when={page.mode === "roles"}>
                      <fieldset class="role-options">
                        <legend>Allowed roles</legend>
                        <For each={["user", "editor", "admin"] as PageRole[]}>
                          {(role) => (
                            <label>
                              <input
                                type="checkbox"
                                checked={page.roles.includes(role)}
                                onChange={(event) =>
                                  togglePageRole(
                                    page,
                                    role,
                                    event.currentTarget.checked,
                                  )
                                }
                              />
                              <span>{role}</span>
                            </label>
                          )}
                        </For>
                      </fieldset>
                    </Show>

                    <footer>
                      <small>
                        {page.customized ? "Customized" : "Plugin default"}
                      </small>
                      <div>
                        <Show when={page.customized}>
                          <button
                            class="text-button"
                            type="button"
                            disabled={savingPage() === page.key}
                            onClick={() => resetPolicy(page)}
                          >
                            Reset
                          </button>
                        </Show>
                        <button
                          class="button compact"
                          type="button"
                          disabled={savingPage() === page.key}
                          onClick={() => savePolicy(page)}
                        >
                          {savingPage() === page.key ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </footer>
                  </article>
                )}
              </For>
            </div>
          </section>
        </Show>
      </Show>

      <Show when={error()}>
        {(message) => <p class="notice error">{message()}</p>}
      </Show>
    </section>
  );
}
