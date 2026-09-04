import { For, createSignal, onMount } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import type { Post } from "../content.ts";
import { listPosts } from "../graphql-client.ts";

export const Route = createFileRoute("/posts/")({
  head: () => ({ meta: [{ title: "Posts · Morph Studio" }] }),
  component: StudioPosts,
});

function StudioPosts() {
  const [posts, setPosts] = createSignal<Post[]>([]);
  const [error, setError] = createSignal<string>();

  onMount(async () => {
    try {
      setPosts(await listPosts({ includeDrafts: true }));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load posts.",
      );
    }
  });

  return (
    <section class="page-section">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Posts plugin · Studio contribution</p>
          <h1>Posts</h1>
        </div>
        <Link class="button" to="/posts/new">
          New post
        </Link>
      </div>

      <div class="project-list">
        <For each={posts()}>
          {(post) => (
            <div class="project-row">
              <span class={`status status-${post.status}`} />
              <span class="project-copy">
                <strong>{post.title}</strong>
                <small>{post.excerpt}</small>
              </span>
              <span class="project-meta">
                <small>{post.status}</small>
                <small>{post.updatedAt}</small>
              </span>
            </div>
          )}
        </For>
      </div>
      {error() && <p class="notice error">{error()}</p>}
    </section>
  );
}
