import { definePlugin } from "@morph/router";

export const profilePlugin = definePlugin({
  name: "profile",
  routes: {
    directory: new URL("./routes", import.meta.url),
    mount: "/profile",
  },
});
