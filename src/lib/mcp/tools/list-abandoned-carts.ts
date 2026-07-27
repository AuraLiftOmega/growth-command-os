import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { failure, result, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_abandoned_carts",
  title: "List abandoned carts",
  description: "List abandoned carts awaiting recovery, with cart totals and contact details.",
  inputSchema: {
    include_recovered: z.boolean().optional().describe("Include already-recovered carts (default false)."),
    limit: z.number().int().optional().describe("Maximum carts to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ include_recovered, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    let query = supabaseForUser(ctx)
      .from("abandoned_carts")
      .select("id, customer_email, cart_total, abandoned_at, recovered, recovery_revenue")
      .order("abandoned_at", { ascending: false })
      .limit(take);
    if (!include_recovered) query = query.eq("recovered", false);
    const { data, error } = await query;
    if (error) return failure(error.message);
    return result(data ?? [], { carts: data ?? [] });
  },
});
