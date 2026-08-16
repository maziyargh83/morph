import { definePlugin } from "@morph/router";

export const postsPlugin = definePlugin({
  name: "posts",
  apps: {
    client: {
      routes: {
        directory: new URL("./routes", import.meta.url),
        mount: "/posts",
      },
    },
    studio: {
      routes: {
        directory: new URL("./studio-routes", import.meta.url),
        mount: "/posts",
      },
    },
  },
});
