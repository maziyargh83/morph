import { definePlugin } from "@morph/router";

export const shopPlugin = definePlugin({
  name: "shop",
  apps: {
    client: {
      routes: {
        directory: new URL("./routes", import.meta.url),
        mount: "/shop",
      },
      pages: [
        {
          path: "/shop",
          label: "Shop",
          defaultAccess: { mode: "public" },
        },
        {
          path: "/shop/product/$id",
          label: "Product details",
          defaultAccess: { mode: "public" },
        },
      ],
    },
  },
});
