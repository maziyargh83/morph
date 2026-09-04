import { definePlugin } from "@morph/router";

export const authPlugin = definePlugin({
  name: "auth",
  apps: {
    client: {
      routes: {
        directory: new URL("./client-routes", import.meta.url),
        mount: "/auth",
      },
    },
    studio: {
      routes: {
        directory: new URL("./studio-routes", import.meta.url),
        mount: "/auth",
      },
    },
  },
});
