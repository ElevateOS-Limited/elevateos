import crypto from "crypto";
const prefixCache = new Map();
export function cacheKey(parts) {
    return crypto.createHash("sha256").update(`${parts.system}\n${parts.skill}\n${parts.policy}`).digest("hex");
}
export function getCachedPrefix(key) {
    return prefixCache.get(key);
}
export function setCachedPrefix(key, value) {
    prefixCache.set(key, value);
}
