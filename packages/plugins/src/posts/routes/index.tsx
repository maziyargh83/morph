import { For } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import { morphPage } from "@morph/router/solid";
import { listPosts } from "../graphql-client.ts";

export const Route = createFileRoute("/posts/")({
  beforeLoad: morphPage,
  loader: () => listPosts(),
  head: () => ({
    meta: [
      { title: "Published posts · Morph" },
      {
        name: "description",
        content: "Published posts rendered by the Morph SSR Client.",
      },
    ],
  }),
  pendingComponent: () => <section class="panel">Loading posts…</section>,
  component: PublicPosts,
});

function PublicPosts() {
  const posts = Route.useLoaderData();

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
    </section>
  );
}
