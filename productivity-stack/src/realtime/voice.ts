import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createRealtimeSession() {
  // Placeholder: create ephemeral key/session for a browser/mobile realtime client.
  // Keep tool calling policy strict here for interruption safety.
  const session = {
    model: "gpt-realtime-1.5",
    input_audio_format: "pcm16",
    output_audio_format: "pcm16",
    turn_detection: { type: "server_vad" },
  };

  return { ok: true, session };
}

export async function interruptionGuard(activeToolCall: boolean) {
  if (activeToolCall) {
    return { ok: false, action: "delay_commit_until_tool_done" };
  }
  return { ok: true, action: "continue" };
}
