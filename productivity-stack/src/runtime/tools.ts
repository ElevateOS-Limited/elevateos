export type ToolCall = { name: string; args: Record<string, unknown> };

export async function runTool(call: ToolCall): Promise<string> {
  switch (call.name) {
    case "echo":
      return JSON.stringify({ ok: true, echo: call.args });
    case "healthcheck":
      return JSON.stringify({ ok: true, ts: Date.now(), status: "healthy" });
    default:
      return JSON.stringify({ ok: false, error: `Unknown tool: ${call.name}` });
  }
}
