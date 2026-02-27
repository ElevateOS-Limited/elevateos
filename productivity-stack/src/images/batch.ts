import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type ImageJob = { id: string; prompt: string; status: "queued" | "submitted" | "done" | "failed" };

const jobs = new Map<string, ImageJob>();

export async function queueImage(prompt: string) {
  const id = `img-${Date.now()}`;
  jobs.set(id, { id, prompt, status: "queued" });
  return id;
}

export async function submitBatch(ids: string[]) {
  for (const id of ids) {
    const j = jobs.get(id);
    if (!j) continue;
    j.status = "submitted";
    // Minimal idempotent placeholder; wire to Batch API file input in production.
    await client.images.generate({ model: "gpt-image-1", prompt: j.prompt, size: "1024x1024" });
    j.status = "done";
  }
  return ids.map((id) => jobs.get(id));
}
