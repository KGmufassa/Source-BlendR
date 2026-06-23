"use client";

import { useMemo, useState } from "react";

const initialLines = [
  {
    id: "line-1",
    description: "Premium tee with front DTF",
    quantity: 50,
    unitCost: 14,
    unitPrice: 23.33,
    snapshot: "SNAP-1042"
  },
  {
    id: "line-2",
    description: "Artwork cleanup",
    quantity: 1,
    unitCost: null,
    unitPrice: null,
    snapshot: null
  }
];

const quotes = [
  { id: "Q-1042", customer: "Northstar Athletics", status: "Pricing incomplete", total: "$1,166.50" },
  { id: "Q-1041", customer: "Metro Awards", status: "Generated", total: "$842.00" },
  { id: "Q-1040", customer: "Summit Contractors", status: "Shared", total: "$3,418.90" }
];

const shareLinks = [
  { id: "share-active", label: "Customer review link", state: "Active", expires: "Jun 28, 2026" },
  { id: "share-expired", label: "Original estimate link", state: "Expired", expires: "Jun 12, 2026" },
  { id: "share-revoked", label: "Internal preview link", state: "Revoked", expires: "Jun 20, 2026" }
];

export function QuoteBuilder() {
  const [lines, setLines] = useState(initialLines);
  const [includeMissingCost, setIncludeMissingCost] = useState(true);
  const visibleLines = useMemo(
    () => lines.filter((line) => includeMissingCost || line.unitCost !== null),
    [includeMissingCost, lines]
  );
  const blockers = visibleLines
    .filter((line) => line.unitCost === null || line.unitPrice === null || !line.snapshot)
    .map((line) => `${line.description} needs a locked pricing snapshot.`);
  const subtotalCost = visibleLines.reduce((sum, line) => sum + (line.unitCost ?? 0) * line.quantity, 0);
  const totalPrice = visibleLines.reduce((sum, line) => sum + (line.unitPrice ?? 0) * line.quantity, 0);
  const grossProfit = totalPrice - subtotalCost;
  const margin = totalPrice === 0 ? 0 : (grossProfit / totalPrice) * 100;
  const isReady = blockers.length === 0;

  return (
    <div className="quote-layout">
      <section className="panel quote-list-panel" aria-labelledby="quote-list-heading">
        <div className="panel-header" id="quote-list-heading">
          Quote queue
        </div>
        <div className="panel-body compact-stack">
          {quotes.map((quote) => (
            <button
              className="quote-list-item"
              data-active={quote.id === "Q-1042"}
              key={quote.id}
              type="button"
            >
              <span>
                <strong>{quote.id}</strong>
                <span>{quote.customer}</span>
              </span>
              <span className={quote.status === "Pricing incomplete" ? "status status-warning" : "status status-success"}>
                {quote.status}
              </span>
              <span>{quote.total}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel quote-header-panel" aria-labelledby="quote-heading">
        <div className="panel-header header-split" id="quote-heading">
          <span>Q-1042 Team shirt order</span>
          <span className={isReady ? "status status-success" : "status status-warning"}>
            {isReady ? "Ready for approval" : "Pricing incomplete"}
          </span>
        </div>
        <div className="panel-body quote-summary-grid">
          <dl className="summary-list vertical">
            <div>
              <dt>Customer</dt>
              <dd>Northstar Athletics</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>Mara Lee</dd>
            </div>
            <div>
              <dt>Pricing tier</dt>
              <dd>Wholesale</dd>
            </div>
          </dl>
          <div className={isReady ? "status-line status-success" : "status-line status-warning"} role="status">
            {isReady ? "Quote is ready for approval and output generation." : "Resolve pricing blockers before approval."}
          </div>
        </div>
      </section>

      <section className="panel quote-lines-panel" aria-labelledby="quote-lines-heading">
        <div className="panel-header header-split" id="quote-lines-heading">
          <span>Line items</span>
          <label className="toggle-row">
            <input
              checked={includeMissingCost}
              onChange={(event) => setIncludeMissingCost(event.target.checked)}
              type="checkbox"
            />
            <span>Show blocked lines</span>
          </label>
        </div>
        <div className="panel-body">
          <table className="table dense-table responsive-table">
            <thead>
              <tr>
                <th>Line</th>
                <th>Qty</th>
                <th>Snapshot</th>
                <th>Unit price</th>
                <th>Readiness</th>
              </tr>
            </thead>
            <tbody>
              {visibleLines.map((line) => (
                <tr key={line.id}>
                  <td data-label="Line">{line.description}</td>
                  <td data-label="Qty">
                    <input
                      aria-label={`${line.description} quantity`}
                      className="inline-number"
                      min="1"
                      type="number"
                      value={line.quantity}
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((candidate) =>
                            candidate.id === line.id
                              ? { ...candidate, quantity: Number(event.target.value) }
                              : candidate
                          )
                        )
                      }
                    />
                  </td>
                  <td data-label="Snapshot">{line.snapshot ?? "Missing"}</td>
                  <td data-label="Unit price">{line.unitPrice === null ? "Blocked" : `$${line.unitPrice.toFixed(2)}`}</td>
                  <td data-label="Readiness">
                    <span className={line.snapshot ? "status status-success" : "status status-danger"}>
                      {line.snapshot ? "Locked" : "Blocked"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {blockers.length > 0 ? (
            <div className="margin-alert" role="alert">
              {blockers.length} blocker: {blockers[0]}
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel quote-margin-panel" aria-labelledby="quote-margin-heading">
        <div className="panel-header" id="quote-margin-heading">
          Margin summary
        </div>
        <div className="panel-body compact-stack">
          <div className="metric-strip">
            <div className="metric">
              <span className="metric-label">Cost</span>
              <span className="metric-value">${subtotalCost.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Price</span>
              <span className="metric-value">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className={margin < 35 ? "metric-value danger-text" : "metric-value success-text"}>
                {margin.toFixed(1)}%
              </span>
              <span className="metric-label">Margin</span>
            </div>
          </div>
          <div className="button-row">
            <button className="button button-primary" disabled={!isReady} type="button">
              Approve quote
            </button>
            <button className="button button-secondary" type="button">
              Request review
            </button>
          </div>
        </div>
      </section>

      <section className="panel quote-output-panel" aria-labelledby="quote-output-heading">
        <div className="panel-header" id="quote-output-heading">
          Generated output
        </div>
        <div className="panel-body compact-stack">
          <div className="progress-row" aria-label="Quote generation progress">
            <span style={{ width: isReady ? "100%" : "64%" }} />
          </div>
          <dl className="summary-list vertical">
            <div>
              <dt>Job</dt>
              <dd>quote.output.generate</dd>
            </div>
            <div>
              <dt>State</dt>
              <dd>{isReady ? "Generated" : "Waiting on pricing"}</dd>
            </div>
          </dl>
          <button className="button button-primary" disabled={!isReady} type="button">
            Generate PDF
          </button>
        </div>
      </section>

      <section className="panel quote-share-panel" aria-labelledby="quote-share-heading">
        <div className="panel-header" id="quote-share-heading">
          Share controls
        </div>
        <div className="panel-body compact-stack">
          <button className="button button-primary" disabled={!isReady} type="button">
            Create secure link
          </button>
          <table className="table dense-table responsive-table">
            <thead>
              <tr>
                <th>Link</th>
                <th>Expires</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {shareLinks.map((link) => (
                <tr key={link.id}>
                  <td data-label="Link">{link.label}</td>
                  <td data-label="Expires">{link.expires}</td>
                  <td data-label="State">
                    <span
                      className={
                        link.state === "Active"
                          ? "status status-success"
                          : link.state === "Expired"
                            ? "status status-warning"
                            : "status status-danger"
                      }
                    >
                      {link.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
