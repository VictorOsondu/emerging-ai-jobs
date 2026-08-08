import { readEvidence } from "./catalogue-lib.mjs";

const active = readEvidence().evidence.filter((record) => record.status === "active");
const failures = [];
const softFailurePatterns = [
  "the job is no longer available",
  "this job is no longer available",
  "this position has been filled",
  "the page you are looking for doesn't exist"
];

async function fetchWithRetry(record) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(record.url, {
        redirect: "follow",
        headers: { "user-agent": "emerging-ai-jobs-source-check/1.0" },
        signal: AbortSignal.timeout(20_000)
      });
      const body = (await response.text()).toLowerCase();
      const softFailure = response.url.includes("error=true") || softFailurePatterns.some((pattern) => body.includes(pattern));
      if (!response.ok || softFailure) {
        throw new Error(`HTTP ${response.status}${softFailure ? " with closed/error page content" : ""}`);
      }
      return { record, status: response.status };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }
  throw new Error(`${record.id}: ${lastError.message}`);
}

const concurrency = 5;
for (let index = 0; index < active.length; index += concurrency) {
  const batch = active.slice(index, index + concurrency);
  const results = await Promise.allSettled(batch.map(fetchWithRetry));
  for (const result of results) {
    if (result.status === "fulfilled") {
      console.log(`OK ${result.value.record.id} HTTP ${result.value.status}`);
    } else {
      failures.push(result.reason.message);
      console.error(`ERROR ${result.reason.message}`);
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} active evidence source(s) require editorial review.`);
  process.exitCode = 1;
} else {
  console.log(`\nChecked ${active.length} active evidence sources.`);
}
