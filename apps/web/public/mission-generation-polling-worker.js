const jobs = new Map();

function post(job, message) {
  self.clients.get(job.clientId).then((client) => client?.postMessage(message));
}

async function poll(job) {
  const startedAt = performance.now();
  try {
    const response = await fetch(job.statusUrl, {
      headers: { Authorization: `Bearer ${job.accessToken}` },
    });
    const durationMs = Math.round(performance.now() - startedAt);
    if (response.status === 401) {
      post(job, {
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
    post(job, {
      type: "mission-generation-poll-status",
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
    post(job, { type: "mission-generation-poll-error", jobId: job.jobId, reason: "network" });
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
  if (message.type !== "mission-generation-poll-start" || !event.source?.id) return;
  const previous = jobs.get(message.jobId);
  if (previous?.timer) clearTimeout(previous.timer);
  const job = {
    accessToken: message.accessToken,
    attemptCount: 0,
    clientId: event.source.id,
    intervalMs: message.intervalMs,
    jobId: message.jobId,
    statusUrl: message.statusUrl,
    timer: null,
  };
  jobs.set(job.jobId, job);
  event.waitUntil(poll(job));
});
