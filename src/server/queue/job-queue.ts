import { randomUUID } from "node:crypto";

export type JobState = "queued" | "processing" | "completed" | "failed";

export type Job<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  type: string;
  payload: TPayload;
  state: JobState;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export type EnqueueJobInput<TPayload extends Record<string, unknown>> = {
  type: string;
  payload: TPayload;
  maxAttempts?: number;
};

export interface JobQueueAdapter {
  enqueue<TPayload extends Record<string, unknown>>(input: EnqueueJobInput<TPayload>): Promise<Job<TPayload>>;
  next(type?: string): Promise<Job | null>;
  complete(jobId: string): Promise<Job>;
  fail(jobId: string, error: string): Promise<Job>;
  retry(jobId: string): Promise<Job>;
  list(state?: JobState): Promise<Job[]>;
}

export class MemoryJobQueueAdapter implements JobQueueAdapter {
  private readonly jobs = new Map<string, Job>();

  async enqueue<TPayload extends Record<string, unknown>>(input: EnqueueJobInput<TPayload>): Promise<Job<TPayload>> {
    const now = new Date().toISOString();
    const job: Job<TPayload> = {
      id: randomUUID(),
      type: input.type,
      payload: { ...input.payload },
      state: "queued",
      attempts: 0,
      maxAttempts: input.maxAttempts ?? 3,
      createdAt: now,
      updatedAt: now
    };

    this.jobs.set(job.id, job);
    return cloneJob(job);
  }

  async next(type?: string): Promise<Job | null> {
    const job = [...this.jobs.values()].find((candidate) => {
      return candidate.state === "queued" && (!type || candidate.type === type);
    });

    if (!job) {
      return null;
    }

    const updated = this.updateJob(job.id, {
      state: "processing",
      attempts: job.attempts + 1
    });
    return cloneJob(updated);
  }

  async complete(jobId: string): Promise<Job> {
    return cloneJob(this.updateJob(jobId, { state: "completed", error: undefined }));
  }

  async fail(jobId: string, error: string): Promise<Job> {
    return cloneJob(this.updateJob(jobId, { state: "failed", error }));
  }

  async retry(jobId: string): Promise<Job> {
    const job = this.requireJob(jobId);
    if (job.attempts >= job.maxAttempts) {
      throw new JobRetryExhaustedError(jobId);
    }

    return cloneJob(this.updateJob(jobId, { state: "queued", error: undefined }));
  }

  async list(state?: JobState): Promise<Job[]> {
    return [...this.jobs.values()]
      .filter((job) => !state || job.state === state)
      .map(cloneJob);
  }

  private updateJob(jobId: string, patch: Partial<Job>): Job {
    const job = this.requireJob(jobId);
    const updated: Job = {
      ...job,
      ...patch,
      updatedAt: new Date().toISOString()
    };
    this.jobs.set(jobId, updated);
    return updated;
  }

  private requireJob(jobId: string): Job {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new JobNotFoundError(jobId);
    }
    return job;
  }
}

export class JobNotFoundError extends Error {
  constructor(public readonly jobId: string) {
    super(`Job ${jobId} was not found.`);
    this.name = "JobNotFoundError";
  }
}

export class JobRetryExhaustedError extends Error {
  constructor(public readonly jobId: string) {
    super(`Job ${jobId} cannot be retried because max attempts are exhausted.`);
    this.name = "JobRetryExhaustedError";
  }
}

function cloneJob<TPayload extends Record<string, unknown>>(job: Job<TPayload>): Job<TPayload> {
  return {
    ...job,
    payload: { ...job.payload }
  };
}
