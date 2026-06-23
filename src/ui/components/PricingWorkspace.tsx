"use client";

import { useMemo, useState } from "react";

const baseComponents = [
  { id: "blank-hoodie", label: "Pullover Hoodie", type: "Product", amount: 18.5, required: true },
  { id: "embroidery", label: "Left chest embroidery", type: "Service", amount: 7.5, required: true },
  { id: "packaging", label: "Poly bag packaging", type: "Packaging", amount: 0.75, required: false },
  { id: "missing-art", label: "Customer artwork cleanup", type: "Service", amount: null, required: false }
];

const auditEvents = [
  "Rule Retail 45 margin target created",
  "Margin preview refreshed from selected components",
  "Approval required because margin is below 35 percent floor"
];

export function PricingWorkspace() {
  const [targetMargin, setTargetMargin] = useState(32);
  const [includeMissingCost, setIncludeMissingCost] = useState(true);
  const components = useMemo(
    () => baseComponents.filter((component) => includeMissingCost || component.amount !== null),
    [includeMissingCost]
  );
  const missingCostComponents = components.filter((component) => component.amount === null);
  const subtotalCost = components.reduce((sum, component) => sum + (component.amount ?? 0), 0);
  const price = targetMargin >= 100 ? 0 : subtotalCost / (1 - targetMargin / 100);
  const grossProfit = price - subtotalCost;
  const marginPercent = price === 0 ? 0 : (grossProfit / price) * 100;
  const lowMargin = marginPercent < 35;
  const approvalRequired = lowMargin || missingCostComponents.length > 0;
  const canApprove = missingCostComponents.length === 0 && !lowMargin;

  return (
    <div className="pricing-layout">
      <section className="panel pricing-control-panel" aria-labelledby="pricing-controls-heading">
        <div className="panel-header" id="pricing-controls-heading">
          Pricing controls
        </div>
        <div className="panel-body compact-stack">
          <label className="field-control">
            <span>Target margin</span>
            <input
              aria-label="Target margin percent"
              min="0"
              max="90"
              type="number"
              value={targetMargin}
              onChange={(event) => setTargetMargin(Number(event.target.value))}
            />
          </label>
          <label className="toggle-row">
            <input
              checked={includeMissingCost}
              onChange={(event) => setIncludeMissingCost(event.target.checked)}
              type="checkbox"
            />
            <span>Include component with missing cost</span>
          </label>
          <div className={approvalRequired ? "status-line status-warning" : "status-line status-success"} role="status">
            {approvalRequired ? "Approval required before publishing." : "Pricing is approved for publishing."}
          </div>
          <div className="button-row">
            <button className="button button-primary" disabled={!canApprove} type="button">
              Approve price
            </button>
            <button className="button button-secondary" type="button">
              Reject
            </button>
            <button className="button button-secondary" type="button">
              Export
            </button>
          </div>
        </div>
      </section>

      <section className="panel margin-panel" aria-labelledby="margin-preview-heading">
        <div className="panel-header" id="margin-preview-heading">
          Margin preview
        </div>
        <div className="panel-body">
          <div className="metric-strip">
            <div className="metric">
              <span className="metric-label">Cost</span>
              <span className="metric-value">${subtotalCost.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Price</span>
              <span className="metric-value">${price.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Margin</span>
              <span className={lowMargin ? "metric-value danger-text" : "metric-value success-text"}>
                {marginPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          {lowMargin ? (
            <div className="margin-alert" role="alert">
              Low margin: the preview is below the 35 percent floor.
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel cost-panel" aria-labelledby="cost-breakdown-heading">
        <div className="panel-header" id="cost-breakdown-heading">
          Cost breakdown
        </div>
        <div className="panel-body">
          <table className="table dense-table responsive-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Type</th>
                <th>Cost</th>
                <th>Readiness</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component) => (
                <tr key={component.id}>
                  <td data-label="Component">{component.label}</td>
                  <td data-label="Type">{component.type}</td>
                  <td data-label="Cost">{component.amount === null ? "Missing" : `$${component.amount.toFixed(2)}`}</td>
                  <td data-label="Readiness">
                    <span className={component.amount === null ? "status status-warning" : "status status-success"}>
                      {component.amount === null ? "Missing costs" : "Ready"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel audit-panel" aria-labelledby="audit-heading">
        <div className="panel-header" id="audit-heading">
          Audit timeline
        </div>
        <div className="panel-body">
          <ol className="timeline">
            {auditEvents.map((event) => (
              <li key={event}>{event}</li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
