import dotenv from "dotenv";
dotenv.config();
export const config = {
    model: process.env.MODEL || "gpt-5.3-codex",
    wsPort: Number(process.env.WS_PORT || 8787),
    apiPort: Number(process.env.API_PORT || 8788),
    redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    sqlitePath: process.env.SQLITE_PATH || "./data/agent.db",
};
