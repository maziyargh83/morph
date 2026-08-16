import { homePlugin } from "./home/main.ts";
import { profilePlugin } from "./profile/main.ts";
import { shopPlugin } from "./shop/main.ts";

export const plugins = [homePlugin, profilePlugin, shopPlugin] as const;

export { homePlugin, profilePlugin, shopPlugin };
