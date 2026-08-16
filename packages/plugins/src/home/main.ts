import { definePlugin } from "@morph/router";

export const homePlugin = definePlugin({
  name: "home",
  routes: {
    directory: new URL("./routes", import.meta.url),
    mount: "/",
  },
});
