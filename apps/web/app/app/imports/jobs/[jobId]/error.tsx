"use client";

import { JobDetailState } from "./job-detail-state";

export default function ImportJobDetailError({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return <JobDetailState kind="error" reset={reset} />;
}
