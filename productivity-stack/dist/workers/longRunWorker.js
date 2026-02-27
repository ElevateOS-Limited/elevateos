import fs from "fs";
import path from "path";
const JOB_DIR = path.resolve("./data/jobs");
fs.mkdirSync(JOB_DIR, { recursive: true });
function checkpoint(job) {
    fs.writeFileSync(path.join(JOB_DIR, `${job.id}.json`), JSON.stringify(job, null, 2));
}
async function runJob(job) {
    job.status = "running";
    checkpoint(job);
    for (let i = job.cursor; i < 10; i++) {
        job.cursor = i + 1;
        checkpoint(job);
        await new Promise((r) => setTimeout(r, 400));
    }
    job.status = "done";
    checkpoint(job);
}
async function bootstrap() {
    const q = process.argv[2] || "default-long-task";
    const job = { id: `job-${Date.now()}`, task: q, cursor: 0, status: "queued" };
    await runJob(job);
    console.log(JSON.stringify({ ok: true, jobId: job.id, status: job.status }));
}
bootstrap().catch((e) => {
    console.error(e);
    process.exit(1);
});
