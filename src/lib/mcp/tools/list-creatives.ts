import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { failure, result, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_creatives",
  title: "List ad creatives",
  description:
    "List ad creatives with performance metrics (ROAS, spend, revenue, status) to review what is winning or losing.",
  inputSchema: {
    status: z.string().optional().describe("Optional status filter, e.g. 'published', 'live', or 'killed'."),
    limit: z.number().int().optional().describe("Maximum creatives to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    let query = supabaseForUser(ctx)
      .from("creatives")
      .select("id, name, platform, status, roas, spend, revenue, conversions, created_at")
      .order("revenue", { ascending: false })
      .limit(take);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return failure(error.message);
    return result(data ?? [], { creatives: data ?? [] });
  },
});
