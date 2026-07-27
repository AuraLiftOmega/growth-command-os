import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { failure, result, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "revenue_summary",
  title: "Revenue summary",
  description:
    "Summarize order revenue over a recent window: total revenue, order count, and average order value.",
  inputSchema: {
    days: z.number().int().optional().describe("Look-back window in days (default 30, max 365)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const window = Math.min(Math.max(days ?? 30, 1), 365);
    const since = new Date(Date.now() - window * 86_400_000).toISOString();
    const { data, error } = await supabaseForUser(ctx)
      .from("shopify_orders")
      .select("total_price, currency, created_at")
      .gte("created_at", since)
      .limit(1000);
    if (error) return failure(error.message);
    const orders = data ?? [];
    const total = orders.reduce((sum, o) => sum + (parseFloat(String(o.total_price)) || 0), 0);
    const summary = {
      window_days: window,
      order_count: orders.length,
      total_revenue: Number(total.toFixed(2)),
      average_order_value: orders.length ? Number((total / orders.length).toFixed(2)) : 0,
      currency: orders[0]?.currency ?? "USD",
    };
    return result(summary, summary);
  },
});
