import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { failure, result, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_orders",
  title: "List orders",
  description:
    "List recent Shopify orders with totals, financial status, and fulfillment status.",
  inputSchema: {
    limit: z.number().int().optional().describe("Maximum orders to return (default 20, max 100)."),
    financial_status: z.string().optional().describe("Optional filter, e.g. 'paid' or 'pending'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, financial_status }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    let query = supabaseForUser(ctx)
      .from("shopify_orders")
      .select(
        "id, order_number, customer_email, total_price, currency, financial_status, fulfillment_status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(take);
    if (financial_status) query = query.eq("financial_status", financial_status);
    const { data, error } = await query;
    if (error) return failure(error.message);
    return result(data ?? [], { orders: data ?? [] });
  },
});
