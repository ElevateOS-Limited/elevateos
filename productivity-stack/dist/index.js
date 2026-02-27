import { startWsServer } from "./api/wsServer.js";
import { startHttpServer } from "./api/httpServer.js";
startWsServer();
startHttpServer();
console.log("productivity-stack started", {
    ws: process.env.WS_PORT || 8787,
    api: process.env.API_PORT || 8788,
});
