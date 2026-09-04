import { definePlugin } from "@morph/router";

export const profilePlugin = definePlugin({
  name: "profile",
  apps: {
    client: {
      routes: {
        directory: new URL("./routes", import.meta.url),
        mount: "/profile",
      },
      pages: [
        {
          path: "/profile",
          label: "Profile",
          defaultAccess: { mode: "authenticated" },
        },
        {
          path: "/profile/settings",
          label: "Profile settings",
          defaultAccess: { mode: "authenticated" },
        },
      ],
    },
  },
});
