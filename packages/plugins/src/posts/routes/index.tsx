import { For } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import { publishedPosts } from "../content.ts";

export const Route = createFileRoute("/posts/")({
  component: PublicPosts,
});

function PublicPosts() {
  return (
    <section class="panel">
      <p class="eyebrow">Posts plugin · Client contribution</p>
      <h1>Published posts</h1>
      <p>
        This public reader is bundled only into the Client application. Post
        authoring belongs to the same plugin's Studio contribution.
      </p>
      <div class="post-list">
        <For each={publishedPosts}>
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
