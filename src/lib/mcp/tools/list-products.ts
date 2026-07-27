import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { failure, result, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List synced Shopify products in the Dominion Revenue OS catalog, optionally filtered by a title/handle search term.",
  inputSchema: {
    search: z.string().optional().describe("Optional text to match against product title or handle."),
    limit: z.number().int().optional().describe("Maximum products to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    let query = supabaseForUser(ctx)
      .from("shopify_products")
      .select("id, title, handle, price, currency_code, product_type, inventory_quantity, status, variant_id")
      .order("updated_at", { ascending: false })
      .limit(take);
    if (search) query = query.or(`title.ilike.%${search}%,handle.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) return failure(error.message);
    return result(data ?? [], { products: data ?? [] });
  },
});
