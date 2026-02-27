import { runTurn } from "../runtime/agent.js";
const cases = [
    { name: "basic response", input: "say hello briefly", expectIncludes: ["hello"] },
    { name: "health tool route", input: "run healthcheck and summarize", expectIncludes: ["health"] },
];
async function main() {
    const results = [];
    for (const c of cases) {
        const out = (await runTurn("eval-suite", c.input)).toLowerCase();
        const pass = c.expectIncludes.every((s) => out.includes(s));
        results.push({ name: c.name, pass, output: out.slice(0, 200) });
    }
    const passCount = results.filter((r) => r.pass).length;
    const summary = { passCount, total: results.length, results };
    console.log(JSON.stringify(summary, null, 2));
    if (passCount !== results.length)
        process.exit(1);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
