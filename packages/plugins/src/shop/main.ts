import { definePlugin } from "@morph/router";

export const shopPlugin = definePlugin({
  name: "shop",
  routes: {
    directory: new URL("./routes", import.meta.url),
    mount: "/shop",
  },
});
