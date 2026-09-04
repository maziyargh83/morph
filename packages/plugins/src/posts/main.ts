import { definePlugin } from "@morph/router";

export const postsPlugin = definePlugin({
  name: "posts",
  apps: {
    client: {
      routes: {
        directory: new URL("./routes", import.meta.url),
        mount: "/posts",
      },
      pages: [
        {
          path: "/posts",
          label: "Published posts",
          defaultAccess: { mode: "public" },
        },
        {
          path: "/posts/$slug",
          label: "Post details",
          defaultAccess: { mode: "public" },
        },
      ],
    },
    studio: {
      routes: {
        directory: new URL("./studio-routes", import.meta.url),
        mount: "/posts",
      },
      pages: [
        {
          path: "/posts",
          label: "Posts",
          defaultAccess: { mode: "roles", roles: ["editor", "admin"] },
        },
        {
          path: "/posts/new",
          label: "Create post",
          defaultAccess: { mode: "roles", roles: ["editor", "admin"] },
        },
      ],
    },
  },
});
