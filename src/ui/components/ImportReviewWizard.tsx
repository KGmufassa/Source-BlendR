"use client";

import { useMemo, useState } from "react";

const sampleRows = [
  {
    rowIndex: 1,
    sku: "HOODIE-001",
    name: "Pullover Hoodie",
    cost: "$18.50",
    status: "Ready",
    issue: ""
  },
  {
    rowIndex: 2,
    sku: "",
    name: "Structured Cap",
    cost: "$7.25",
    status: "Blocked",
    issue: "SKU is required."
  },
  {
    rowIndex: 3,
    sku: "TEE-014",
    name: "Heavy Cotton Tee",
    cost: "not mapped",
    status: "Blocked",
    issue: "Unit cost must be mapped before commit."
  }
];

const mappingFields = [
  { key: "sku", label: "SKU", value: "SKU" },
  { key: "name", label: "Name", value: "Product Name" },
  { key: "unitCost", label: "Unit cost", value: "" },
  { key: "currency", label: "Currency", value: "Currency" }
];

export function ImportReviewWizard() {
  const [unitCostMapping, setUnitCostMapping] = useState("");
  const rows = useMemo(() => {
    return sampleRows.map((row) => {
      if (row.rowIndex === 3 && unitCostMapping === "Cost") {
        return {
          ...row,
          cost: "$5.40",
          status: "Ready",
          issue: ""
        };
      }

      return row;
    });
  }, [unitCostMapping]);
  const blockingRows = rows.filter((row) => row.status === "Blocked");
  const canCommit = unitCostMapping === "Cost" && blockingRows.length === 1;
  const commitExplanation = canCommit
    ? "One row remains excluded from commit until its SKU is fixed."
    : "Commit is disabled until unit cost is mapped and blocking row errors are resolved.";

  return (
    <div className="workflow-grid">
      <section className="panel step-panel" aria-label="Import steps">
        <div className="step-list">
          {["Upload", "Map fields", "Validate", "Commit"].map((step, index) => (
            <div className="step-item" data-active={index === 1 || index === 2} key={step}>
              <span className="step-index">{index + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel upload-panel" aria-labelledby="upload-heading">
        <div className="panel-header" id="upload-heading">
          Upload source
        </div>
        <div className="panel-body compact-stack">
          <div className="drop-zone" tabIndex={0}>
            <strong>wholesale-products.csv</strong>
            <span>3 rows preserved from supplier file source</span>
          </div>
          <div className="status-line status-info">Async validation queued for import.validation</div>
        </div>
      </section>

      <section className="panel mapping-panel" aria-labelledby="mapping-heading">
        <div className="panel-header" id="mapping-heading">
          Field mapping
        </div>
        <div className="panel-body field-grid">
          {mappingFields.map((field) => (
            <label className="field-control" key={field.key}>
              <span>{field.label}</span>
              <select
                aria-label={`${field.label} source column`}
                value={field.key === "unitCost" ? unitCostMapping : field.value}
                onChange={(event) => setUnitCostMapping(event.target.value)}
              >
                <option value="">Choose column</option>
                <option value="SKU">SKU</option>
                <option value="Product Name">Product Name</option>
                <option value="Cost">Cost</option>
                <option value="Currency">Currency</option>
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className="panel validation-panel" aria-labelledby="validation-heading">
        <div className="panel-header header-split" id="validation-heading">
          <span>Validation results</span>
          <a className="button button-secondary" href="#error-report">
            Download error report
          </a>
        </div>
        <div className="panel-body">
          <div className="validation-summary" role="status">
            <strong>{blockingRows.length} blocking rows</strong>
            <span>Errors are labeled in text and remain visible while editing mapping.</span>
          </div>
          <table className="table dense-table responsive-table">
            <thead>
              <tr>
                <th>Row</th>
                <th>SKU</th>
                <th>Name</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr data-state={row.status.toLowerCase()} key={row.rowIndex}>
                  <td data-label="Row">{row.rowIndex}</td>
                  <td data-label="SKU">{row.sku || "Missing"}</td>
                  <td data-label="Name">{row.name}</td>
                  <td data-label="Cost">{row.cost}</td>
                  <td data-label="Status">
                    <span className={row.status === "Ready" ? "status status-success" : "status status-danger"}>
                      {row.status}
                    </span>
                  </td>
                  <td data-label="Issue">{row.issue || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel commit-panel" aria-labelledby="commit-heading">
        <div className="panel-header" id="commit-heading">
          Commit summary
        </div>
        <div className="panel-body compact-stack">
          <dl className="summary-list">
            <div>
              <dt>Creates</dt>
              <dd>2 assets</dd>
            </div>
            <div>
              <dt>Skipped</dt>
              <dd>1 blocked row</dd>
            </div>
            <div>
              <dt>Overwrite policy</dt>
              <dd>No silent overwrite</dd>
            </div>
          </dl>
          <p className="explanation">{commitExplanation}</p>
          <button className="button button-primary sticky-action" disabled={!canCommit} type="button">
            Commit valid assets
          </button>
        </div>
      </section>
    </div>
  );
}
