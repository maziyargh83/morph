import { For } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { listStudioPosts } from "../server/posts.server.ts";

const getStudioPosts = createServerFn({ method: "GET" }).handler(async () =>
  listStudioPosts(),
);

export const Route = createFileRoute("/posts/")({
  loader: () => getStudioPosts(),
  head: () => ({ meta: [{ title: "Posts · Morph Studio" }] }),
  component: StudioPosts,
});

function StudioPosts() {
  const posts = Route.useLoaderData();

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
    </section>
  );
}
