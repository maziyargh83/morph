import { For, createSignal, onMount } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import type { Post } from "../content.ts";
import { listPosts } from "../graphql-client.ts";
import { requireClientPageAccess } from "../../auth/client-guard.ts";

export const Route = createFileRoute("/posts/")({
  beforeLoad: () => requireClientPageAccess("/posts"),
  component: PublicPosts,
});

function PublicPosts() {
  const [posts, setPosts] = createSignal<Post[]>([]);
  const [error, setError] = createSignal<string>();

  onMount(async () => {
    try {
      setPosts(await listPosts());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load posts.",
      );
    }
  });

  return (
    <section class="panel">
      <p class="eyebrow">Posts plugin · Client contribution</p>
      <h1>Published posts</h1>
      <p>
        This public reader is bundled only into the Client application. Post
        authoring belongs to the same plugin's Studio contribution.
      </p>
      <div class="post-list">
        <For each={posts()}>
          {(post) => (
            <Link
              class="post-row"
              to="/posts/$slug"
              params={{ slug: post.slug }}
            >
              <strong>{post.title}</strong>
              <span>{post.excerpt}</span>
            </Link>
          )}
        </For>
      </div>
      {error() && <p class="notice error">{error()}</p>}
    </section>
  );
}
