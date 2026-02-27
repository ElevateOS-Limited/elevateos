import { z } from "zod";

export const skillSchema = z.object({
  name: z.string(),
  description: z.string(),
  guardrail: z.string(),
});

export type Skill = z.infer<typeof skillSchema>;

export const skills: Skill[] = [
  {
    name: "code-assistant",
    description: "Writes, refactors, and reviews code with tests.",
    guardrail: "Never run destructive shell commands without explicit confirmation.",
  },
  {
    name: "researcher",
    description: "Summarizes docs/pages into concise actionable notes.",
    guardrail: "Cite source URLs and avoid fabricated facts.",
  },
  {
    name: "ops-helper",
    description: "System diagnostics, checks, and runbook generation.",
    guardrail: "No production mutations unless user explicitly asked.",
  },
];

export function routeSkill(task: string): Skill {
  const t = task.toLowerCase();
  if (t.includes("code") || t.includes("bug") || t.includes("refactor")) return skills[0];
  if (t.includes("research") || t.includes("summar")) return skills[1];
  return skills[2];
}
