import fs from "fs";
import path from "path";
const STATE_DIR = path.resolve("./data/state");
function ensureDir() {
    fs.mkdirSync(STATE_DIR, { recursive: true });
}
export function loadState(id) {
    ensureDir();
    const p = path.join(STATE_DIR, `${id}.json`);
    if (!fs.existsSync(p))
        return { id, messages: [], updatedAt: Date.now(), attempts: 0 };
    return JSON.parse(fs.readFileSync(p, "utf8"));
}
export function saveState(state) {
    ensureDir();
    state.updatedAt = Date.now();
    const p = path.join(STATE_DIR, `${state.id}.json`);
    fs.writeFileSync(p, JSON.stringify(state, null, 2));
}
