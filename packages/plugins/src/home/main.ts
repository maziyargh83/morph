import { definePlugin } from "@morph/router";

export const homePlugin = definePlugin({
  name: "home",
  apps: {
    client: {
      routes: {
        directory: new URL("./routes", import.meta.url),
        mount: "/",
      },
      pages: [
        { path: "/", label: "Home", defaultAccess: { mode: "public" } },
        {
          path: "/about",
          label: "About",
          defaultAccess: { mode: "public" },
        },
      ],
    },
    studio: {
      routes: {
        directory: new URL("./studio-routes", import.meta.url),
        mount: "/",
      },
      pages: [
        {
          path: "/",
          label: "Overview",
          defaultAccess: { mode: "roles", roles: ["editor", "admin"] },
        },
        {
          path: "/activity",
          label: "Activity",
          defaultAccess: { mode: "roles", roles: ["editor", "admin"] },
        },
        {
          path: "/projects",
          label: "Projects",
          defaultAccess: { mode: "roles", roles: ["editor", "admin"] },
        },
        {
          path: "/projects/$projectId",
          label: "Project details",
          defaultAccess: { mode: "roles", roles: ["editor", "admin"] },
        },
        {
          path: "/settings",
          label: "Studio settings",
          defaultAccess: { mode: "roles", roles: ["admin"] },
        },
      ],
    },
  },
});
