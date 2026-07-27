import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

// Runs inside the generated Deno edge function, where `process.env` is provided.
declare const process: { env: Record<string, string | undefined> };


/** Supabase client scoped to the signed-in MCP caller, so RLS runs as that user. */
export function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export function unauthenticated() {
  return {
    content: [{ type: "text" as const, text: "Not authenticated." }],
    isError: true,
  };
}

export function result(data: unknown, structured?: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
    ...(structured ? { structuredContent: structured } : {}),
  };
}

export function failure(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}
