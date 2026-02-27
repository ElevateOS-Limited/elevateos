export async function runTool(call) {
    switch (call.name) {
        case "echo":
            return JSON.stringify({ ok: true, echo: call.args });
        case "healthcheck":
            return JSON.stringify({ ok: true, ts: Date.now(), status: "healthy" });
        default:
            return JSON.stringify({ ok: false, error: `Unknown tool: ${call.name}` });
    }
}
