import { definePluginCatalog } from "@morph/router";
import { homePlugin } from "./home/main.ts";
import { postsPlugin } from "./posts/main.ts";
import { profilePlugin } from "./profile/main.ts";
import { shopPlugin } from "./shop/main.ts";

/** Package-owned manifest catalog. Route modules are not imported here. */
export const pluginCatalog = definePluginCatalog([
  homePlugin,
  postsPlugin,
  profilePlugin,
  shopPlugin,
]);

/** Common generator boundary for package-owned route contributions. */
export const pluginRoutesDirectory = new URL("./", import.meta.url);

export { homePlugin, postsPlugin, profilePlugin, shopPlugin };
