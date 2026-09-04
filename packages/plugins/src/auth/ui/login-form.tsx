import { Show, createSignal } from "solid-js";
import { authClient } from "../client.ts";

export function LoginForm(props: {
  destination: string;
  allowSignUp?: boolean;
}) {
  const [mode, setMode] = createSignal<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = createSignal<string>();
  const [submitting, setSubmitting] = createSignal(false);

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);

    const data = new FormData(event.currentTarget as HTMLFormElement);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "").trim();

    const result =
      mode() === "sign-up"
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "Authentication failed.");
      setSubmitting(false);
      return;
    }

    window.location.assign(props.destination);
  };

  return (
    <div class="auth-card">
      <div>
        <p class="eyebrow">Auth plugin · Better Auth</p>
        <h1>{mode() === "sign-in" ? "Welcome back" : "Create account"}</h1>
        <p>
          Sessions are stored in PostgreSQL and shared with the GraphQL API.
        </p>
      </div>

      <form class="editor-form" onSubmit={submit}>
        <Show when={mode() === "sign-up"}>
          <label>
            <span>Name</span>
            <input name="name" autocomplete="name" required />
          </label>
        </Show>
        <label>
          <span>Email</span>
          <input name="email" type="email" autocomplete="email" required />
        </label>
        <label>
          <span>Password</span>
          <input
            name="password"
            type="password"
            autocomplete={
              mode() === "sign-in" ? "current-password" : "new-password"
            }
            minlength="8"
            required
          />
        </label>
        <button class="button" type="submit" disabled={submitting()}>
          {submitting()
            ? "Please wait…"
            : mode() === "sign-in"
              ? "Sign in"
              : "Sign up"}
        </button>
      </form>

      <Show when={error()}>
        {(message) => <p class="notice error">{message()}</p>}
      </Show>

      <Show when={props.allowSignUp}>
        <button
          class="text-button"
          type="button"
          onClick={() => setMode(mode() === "sign-in" ? "sign-up" : "sign-in")}
        >
          {mode() === "sign-in"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </Show>
    </div>
  );
}
