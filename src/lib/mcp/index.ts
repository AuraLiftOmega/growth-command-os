import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import listOrders from "./tools/list-orders";
import revenueSummary from "./tools/revenue-summary";
import listAbandonedCarts from "./tools/list-abandoned-carts";
import listCreatives from "./tools/list-creatives";
import logDecision from "./tools/log-decision";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "dominion-revenue-os",
  title: "Dominion Revenue OS",
  version: "0.1.0",
  instructions:
    "Tools for Dominion Revenue OS (Aura Lift Essentials). Read the product catalog, orders, revenue summaries, abandoned carts, and ad creative performance, and log operator decisions. All data is scoped to the signed-in user's permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProducts, listOrders, revenueSummary, listAbandonedCarts, listCreatives, logDecision],
});
