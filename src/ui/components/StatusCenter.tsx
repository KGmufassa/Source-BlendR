"use client";

import { useState } from "react";

const jobs = [
  {
    id: "JOB-9821",
    type: "quote.output.generate",
    subject: "Q-1042 Team shirt order",
    state: "Failed",
    attempts: "1 / 3",
    retryEligible: true,
    supportRef: "SUP-1042",
    detail: "Renderer unavailable after template validation. Credentials and tokens were redacted."
  },
  {
    id: "JOB-9819",
    type: "import.validate",
    subject: "Acme apparel import",
    state: "Queued",
    attempts: "0 / 3",
    retryEligible: false,
    supportRef: "SUP-1039",
    detail: "Validation queued behind supplier synchronization."
  },
  {
    id: "JOB-9817",
    type: "pricing.recalculate",
    subject: "Retail margin snapshots",
    state: "Completed",
    attempts: "1 / 3",
    retryEligible: false,
    supportRef: "SUP-1037",
    detail: "Pricing snapshots recalculated without blocked records."
  }
];

export function StatusCenter() {
  const [selectedJobId, setSelectedJobId] = useState("JOB-9821");
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  const failedJobs = jobs.filter((job) => job.state === "Failed");

  return (
    <div className="status-layout">
      <section className="panel status-failures-panel" aria-labelledby="failed-jobs-heading">
        <div className="panel-header header-split" id="failed-jobs-heading">
          <span>Failed jobs</span>
          <span className="status status-danger">{failedJobs.length} needs attention</span>
        </div>
        <div className="panel-body compact-stack">
          {failedJobs.map((job) => (
            <button className="job-card" key={job.id} onClick={() => setSelectedJobId(job.id)} type="button">
              <span>
                <strong>{job.id}</strong>
                <span>{job.subject}</span>
              </span>
              <span className="status status-danger">{job.state}</span>
              <span>{job.supportRef}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel status-table-panel" aria-labelledby="job-table-heading">
        <div className="panel-header header-split" id="job-table-heading">
          <span>Async jobs</span>
          <div className="filter-bar inline-filter">
            <label className="field-control">
              <span>State</span>
              <select aria-label="Job state filter" defaultValue="all">
                <option value="all">All</option>
                <option value="failed">Failed</option>
                <option value="queued">Queued</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>
        </div>
        <div className="panel-body">
          <table className="table dense-table responsive-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Attempts</th>
                <th>State</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr data-state={job.state.toLowerCase()} key={job.id}>
                  <td data-label="Job">
                    <button className="link-button" onClick={() => setSelectedJobId(job.id)} type="button">
                      {job.id}
                    </button>
                  </td>
                  <td data-label="Type">{job.type}</td>
                  <td data-label="Subject">{job.subject}</td>
                  <td data-label="Attempts">{job.attempts}</td>
                  <td data-label="State">
                    <span
                      className={
                        job.state === "Failed"
                          ? "status status-danger"
                          : job.state === "Completed"
                            ? "status status-success"
                            : "status status-info"
                      }
                    >
                      {job.state}
                    </span>
                  </td>
                  <td data-label="Action">
                    <button className="button table-action" disabled={!job.retryEligible} type="button">
                      Retry
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="panel detail-drawer job-detail-panel" aria-labelledby="job-detail-heading">
        <div className="panel-header" id="job-detail-heading">
          Job detail
        </div>
        <div className="panel-body compact-stack">
          <dl className="summary-list vertical">
            <div>
              <dt>Job</dt>
              <dd>{selectedJob.id}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{selectedJob.type}</dd>
            </div>
            <div>
              <dt>Support ref</dt>
              <dd>{selectedJob.supportRef}</dd>
            </div>
            <div>
              <dt>Retry</dt>
              <dd>{selectedJob.retryEligible ? "Eligible" : "Unavailable"}</dd>
            </div>
          </dl>
          <div className="status-line status-info" role="status">
            {selectedJob.detail}
          </div>
          <div className="button-row">
            <button className="button button-primary" disabled={!selectedJob.retryEligible} type="button">
              Retry job
            </button>
            <button className="button button-secondary" type="button">
              Copy ref
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
