import http from "http";
import { config } from "../config.js";
import { runTurn } from "../runtime/agent.js";

export function startHttpServer() {
  const server = http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/turn") {
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(c as Buffer);
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      const reply = await runTurn(body.conversationId || "default", body.text || "");
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, reply }));
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404).end();
  });

  server.listen(config.apiPort);
  return server;
}
