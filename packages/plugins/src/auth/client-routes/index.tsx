import { Show, createSignal, onMount } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import { authClient } from "../client.ts";

type CurrentSession = Awaited<ReturnType<typeof authClient.getSession>>["data"];

export const Route = createFileRoute("/auth/")({
  component: AccountPage,
});

function AccountPage() {
  const [session, setSession] = createSignal<CurrentSession>();
  const [loaded, setLoaded] = createSignal(false);

  onMount(async () => {
    const result = await authClient.getSession();
    setSession(result.data);
    setLoaded(true);
  });

  const signOut = async () => {
    await authClient.signOut();
    setSession(null);
  };

  return (
    <section class="panel auth-card">
      <p class="eyebrow">Auth plugin · Client contribution</p>
      <Show when={loaded()} fallback={<p>Loading session…</p>}>
        <Show
          when={session()}
          fallback={
            <>
              <h1>Your account</h1>
              <p>Sign in to get a database-backed session.</p>
              <Link class="button" to="/auth/login">
                Sign in
              </Link>
            </>
          }
        >
          {(current) => (
            <>
              <h1>{current().user.name}</h1>
              <dl class="auth-details">
                <div>
                  <dt>Email</dt>
                  <dd>{current().user.email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{String(current().user.role ?? "user")}</dd>
                </div>
              </dl>
              <button class="button" type="button" onClick={signOut}>
                Sign out
              </button>
            </>
          )}
        </Show>
      </Show>
    </section>
  );
}
