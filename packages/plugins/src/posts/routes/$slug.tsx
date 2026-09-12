import { Show } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import { morphPage } from "@morph/router/solid";
import { getPost } from "../graphql-client.ts";

export const Route = createFileRoute("/posts/$slug")({
  beforeLoad: morphPage,
  loader: ({ params }) => getPost(params.slug),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} · Morph` : "Post · Morph" },
      ...(loaderData
        ? [{ name: "description", content: loaderData.excerpt }]
        : []),
    ],
  }),
  pendingComponent: () => <section class="panel">Loading post…</section>,
  component: PublicPost,
});

function PublicPost() {
  const post = Route.useLoaderData();

  return (
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
  );
}
