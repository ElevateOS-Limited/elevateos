import { WebSocketServer } from "ws";
import { config } from "../config.js";
import { runTurn } from "../runtime/agent.js";

export function startWsServer() {
  const wss = new WebSocketServer({ port: config.wsPort });

  wss.on("connection", (ws: any) => {
    ws.on("message", async (buf: Buffer) => {
      try {
        const payload = JSON.parse(buf.toString());
        const conversationId = payload.conversationId || "default";
        const text = payload.text || "";
        const reply = await runTurn(conversationId, text);
        ws.send(JSON.stringify({ ok: true, reply }));
      } catch (e: any) {
        ws.send(JSON.stringify({ ok: false, error: e?.message || "unknown_error" }));
      }
    });
  });

  return wss;
}
