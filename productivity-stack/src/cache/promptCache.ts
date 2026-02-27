import crypto from "crypto";

const prefixCache = new Map<string, string>();

export function cacheKey(parts: { system: string; skill: string; policy: string }) {
  return crypto.createHash("sha256").update(`${parts.system}\n${parts.skill}\n${parts.policy}`).digest("hex");
}

export function getCachedPrefix(key: string) {
  return prefixCache.get(key);
}

export function setCachedPrefix(key: string, value: string) {
  prefixCache.set(key, value);
}
