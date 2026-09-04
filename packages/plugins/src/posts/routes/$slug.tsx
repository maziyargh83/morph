import { Show, createSignal, onMount } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import type { Post } from "../content.ts";
import { getPost } from "../graphql-client.ts";
import { requireClientPageAccess } from "../../auth/client-guard.ts";

export const Route = createFileRoute("/posts/$slug")({
  beforeLoad: () => requireClientPageAccess("/posts/$slug"),
  component: PublicPost,
});

function PublicPost() {
  const params = Route.useParams();
  const [post, setPost] = createSignal<Post | null>();

  onMount(async () => setPost(await getPost(params().slug)));

  return (
    <Show when={post() !== undefined} fallback={<p>Loading post…</p>}>
      <Show when={post()} fallback={<p>Post not found.</p>}>
        {(current) => (
          <article class="panel">
            <p class="eyebrow">Published · {current().updatedAt}</p>
            <h1>{current().title}</h1>
            <p>{current().body}</p>
            <Link class="button" to="/posts">
              Back to posts
            </Link>
          </article>
        )}
      </Show>
    </Show>
  );
}
