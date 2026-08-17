const jobs = new Map();

async function post(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  for (const client of clients) client.postMessage(message);
}

async function poll(job) {
  const startedAt = performance.now();
  try {
    const response = await fetch(job.statusUrl, {
      headers: { Authorization: `Bearer ${job.accessToken}` },
    });
    const durationMs = Math.round(performance.now() - startedAt);
    if (response.status === 401) {
      post({
        type: "mission-generation-poll-error",
        jobId: job.jobId,
        reason: "unauthorized",
        durationMs,
      });
      jobs.delete(job.jobId);
      return;
    }
    if (!response.ok) throw new Error(`status ${response.status}`);
    const jobStatus = await response.json();
    if (Number.isFinite(jobStatus.pollingIntervalMillis)) {
      job.intervalMs = Math.min(5000, Math.max(2000, jobStatus.pollingIntervalMillis));
    }
    job.attemptCount += 1;
    post({
      type: "mission-generation-poll-status",
      jobId: job.jobId,
      job: jobStatus,
      attemptCount: job.attemptCount,
      durationMs,
    });
    if (
      jobStatus.status === "FAILED" ||
      (jobStatus.status === "SUCCEEDED" && jobStatus.draftsAvailable)
    ) {
      jobs.delete(job.jobId);
      return;
    }
  } catch {
    post({
      type: "mission-generation-poll-error",
      jobId: job.jobId,
      reason: "network",
    });
  }
  if (jobs.has(job.jobId)) job.timer = setTimeout(() => poll(job), job.intervalMs);
}

self.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message.type !== "string") return;
  if (message.type === "mission-generation-poll-stop") {
    const job = jobs.get(message.jobId);
    if (job?.timer) clearTimeout(job.timer);
    jobs.delete(message.jobId);
    return;
  }
  if (message.type !== "mission-generation-poll-start") return;
  const previous = jobs.get(message.jobId);
  if (previous?.timer) clearTimeout(previous.timer);
  const job = {
    accessToken: message.accessToken,
    attemptCount: 0,
    intervalMs: message.intervalMs,
    jobId: message.jobId,
    statusUrl: message.statusUrl,
    timer: null,
  };
  jobs.set(job.jobId, job);
  event.waitUntil(poll(job));
});
