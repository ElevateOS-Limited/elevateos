import OpenAI from "openai";
import { config } from "../config.js";
import { loadState, saveState } from "./state.js";
import { routeSkill } from "../skills/registry.js";
import { cacheKey, getCachedPrefix, setCachedPrefix } from "../cache/promptCache.js";
import { runTool } from "./tools.js";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function runTurn(conversationId, userText) {
    const state = loadState(conversationId);
    const skill = routeSkill(userText);
    const system = "You are a production assistant focused on correctness and speed.";
    const policy = "Be concise. Use tools when useful. Never fabricate outputs.";
    const k = cacheKey({ system, skill: skill.name, policy });
    let prefix = getCachedPrefix(k);
    if (!prefix) {
        prefix = [system, `Skill: ${skill.name} - ${skill.description}`, `Guardrail: ${skill.guardrail}`, policy].join("\n");
        setCachedPrefix(k, prefix);
    }
    state.messages.push({ role: "user", content: userText });
    let retries = 2;
    while (retries >= 0) {
        try {
            const response = await client.responses.create({
                model: config.model,
                input: [
                    { role: "system", content: [{ type: "input_text", text: prefix }] },
                    ...state.messages
                        .filter((m) => m.role === "user" || m.role === "assistant")
                        .map((m) => ({
                        role: m.role,
                        content: [{ type: "input_text", text: m.content }],
                    })),
                ],
                tools: [
                    {
                        type: "function",
                        name: "echo",
                        description: "Echo args for debugging",
                        parameters: { type: "object", additionalProperties: true },
                        strict: false,
                    },
                    {
                        type: "function",
                        name: "healthcheck",
                        description: "Return health status",
                        parameters: { type: "object", properties: {} },
                        strict: false,
                    },
                ],
            });
            const outputs = response.output || [];
            for (const item of outputs) {
                if (item.type === "function_call") {
                    const c = item;
                    const toolResult = await runTool({ name: c.name, args: JSON.parse(c.arguments || "{}") });
                    state.messages.push({ role: "tool", content: toolResult });
                }
            }
            const text = response.output_text || "";
            state.messages.push({ role: "assistant", content: text });
            saveState(state);
            return text;
        }
        catch (err) {
            retries -= 1;
            state.attempts += 1;
            saveState(state);
            if (retries < 0)
                throw err;
            await new Promise((r) => setTimeout(r, 500 * (3 - retries)));
        }
    }
    return "";
}
