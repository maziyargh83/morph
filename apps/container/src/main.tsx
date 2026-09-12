import { RouterProvider, createRouter } from "@tanstack/solid-router";
import { render } from "solid-js/web";
import { routeTree } from "./routeTree.gen";
import { createMorphRouterContext } from "@morph/router/solid";
import { requireClientPageAccess } from "@morph/plugins/auth/client-guard";
import "./styles.css";
import { TanStackDevtools } from "@tanstack/solid-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/solid-router-devtools";

const router = createRouter({
  routeTree,
  context: createMorphRouterContext(requireClientPageAccess),
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");
render(
  () => (
    <>
      <RouterProvider router={router} />
      <TanStackDevtools
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel router={router} />,
          },
        ]}
      />
    </>
  ),
  rootElement!,
);
