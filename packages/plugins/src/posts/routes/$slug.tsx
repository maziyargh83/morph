import { Link, createFileRoute, notFound } from "@tanstack/solid-router";
import { publishedPosts } from "../content.ts";

export const Route = createFileRoute("/posts/$slug")({
  loader: ({ params }) => {
    const post = publishedPosts.find(
      (candidate) => candidate.slug === params.slug,
    );
    if (!post) throw notFound();
    return post;
  },
  component: PublicPost,
});

function PublicPost() {
  const post = Route.useLoaderData();

  return (
    <article class="panel">
      <p class="eyebrow">Published · {post().updatedAt}</p>
      <h1>{post().title}</h1>
      <p>{post().body}</p>
      <Link class="button" to="/posts">
        Back to posts
      </Link>
    </article>
  );
}
