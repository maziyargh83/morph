import { Show, createSignal } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import { createPost } from "../graphql-client.ts";
import { requireStudioPageAccess } from "../../auth/studio-guard.ts";

export const Route = createFileRoute("/posts/new")({
  beforeLoad: () => requireStudioPageAccess("/posts/new"),
  head: () => ({ meta: [{ title: "New post · Morph Studio" }] }),
  component: NewPost,
});

function NewPost() {
  const [createdSlug, setCreatedSlug] = createSignal<string>();
  const [error, setError] = createSignal<string>();
  const [submitting, setSubmitting] = createSignal(false);

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const post = await createPost({
        title: String(formData.get("title") ?? ""),
        excerpt: String(formData.get("excerpt") ?? ""),
        body: String(formData.get("body") ?? ""),
      });
      setCreatedSlug(post.slug);
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section class="page-section">
      <Link class="back-link" to="/posts">
        ← All posts
      </Link>
      <div>
        <p class="eyebrow">GraphQL mutation · editor access</p>
        <h1>New post</h1>
      </div>

      <form class="editor-form" onSubmit={submit}>
        <label>
          <span>Title</span>
          <input name="title" placeholder="A useful title" required />
        </label>
        <label>
          <span>Excerpt</span>
          <input name="excerpt" placeholder="One sentence summary" required />
        </label>
        <label>
          <span>Body</span>
          <textarea
            name="body"
            rows="8"
            placeholder="Write the post…"
            required
          />
        </label>
        <button class="button" type="submit" disabled={submitting()}>
          {submitting() ? "Saving…" : "Save draft"}
        </button>
      </form>

      <Show when={createdSlug()}>
        {(slug) => (
          <p class="notice success">
            Draft <code>{slug()}</code> was saved in PostgreSQL.
          </p>
        )}
      </Show>
      <Show when={error()}>
        {(message) => <p class="notice error">{message()}</p>}
      </Show>
    </section>
  );
}
