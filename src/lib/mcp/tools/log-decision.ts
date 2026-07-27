import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { failure, result, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "log_decision",
  title: "Log an AI decision",
  description:
    "Record a decision or action in the Dominion Revenue OS AI decision log for the signed-in operator.",
  inputSchema: {
    decision_type: z.string().describe("Short category, e.g. 'pricing', 'ad_scaling', 'inventory'."),
    action_taken: z.string().describe("What was decided or done."),
    reasoning: z.string().optional().describe("Why this decision was made."),
    confidence: z.number().optional().describe("Confidence between 0 and 1."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ decision_type, action_taken, reasoning, confidence }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const score = Math.min(Math.max(confidence ?? 1, 0), 1);
    const { data, error } = await supabaseForUser(ctx)
      .from("ai_decision_log")
      .insert({
        user_id: ctx.getUserId(),
        decision_type,
        action_taken,
        reasoning: reasoning ?? null,
        confidence: score,
        execution_status: "completed",
      })
      .select()
      .single();
    if (error) return failure(error.message);
    return result(data, { decision: data });
  },
});
