import { Show, createSignal } from "solid-js";
import { Link, createFileRoute, useRouter } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import {
  createStudioPost,
  type CreatePostInput,
} from "../server/posts.server.ts";

const createPost = createServerFn({ method: "POST" })
  .validator((input: CreatePostInput) => {
    const title = input.title.trim();
    const excerpt = input.excerpt.trim();
    const body = input.body.trim();

    if (!title || !excerpt || !body) {
      throw new Error("Title, excerpt, and body are required.");
    }

    return { title, excerpt, body };
  })
  .handler(async ({ data }) => createStudioPost(data));

export const Route = createFileRoute("/posts/new")({
  head: () => ({ meta: [{ title: "New post · Morph Studio" }] }),
  component: NewPost,
});

function NewPost() {
  const router = useRouter();
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
        data: {
          title: String(formData.get("title") ?? ""),
          excerpt: String(formData.get("excerpt") ?? ""),
          body: String(formData.get("body") ?? ""),
        },
      });
      setCreatedSlug(post.slug);
      form.reset();
      await router.invalidate();
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
        <p class="eyebrow">POST server function + validation</p>
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
            Draft saved as <code>{slug()}</code>. The Studio loader has been
            invalidated.
          </p>
        )}
      </Show>
      <Show when={error()}>
        {(message) => <p class="notice error">{message()}</p>}
      </Show>
    </section>
  );
}
