"use client";

import { useMemo, useState } from "react";

const availableComponents = [
  { id: "hoodie", label: "Pullover Hoodie", type: "Product", cost: 18.5 },
  { id: "embroidery", label: "Left chest embroidery", type: "Service", cost: 7.5 },
  { id: "packaging", label: "Poly bag packaging", type: "Packaging", cost: 0.75 },
  { id: "artwork", label: "Artwork cleanup", type: "Service", cost: null }
];

export function BundleRecipeBuilder() {
  const [selectedComponentId, setSelectedComponentId] = useState("hoodie");
  const [quantity, setQuantity] = useState(24);
  const [componentIds, setComponentIds] = useState(["hoodie", "embroidery", "artwork"]);
  const components = componentIds
    .map((id) => availableComponents.find((component) => component.id === id))
    .filter((component): component is (typeof availableComponents)[number] => Boolean(component));
  const missingCost = components.filter((component) => component.cost === null);
  const hasProduct = components.some((component) => component.type === "Product");
  const hasService = components.some((component) => component.type === "Service");
  const scaledCost = components.reduce((sum, component) => sum + (component.cost ?? 0), 0) * quantity;
  const blockers = [
    !hasProduct ? "Add at least one product component." : "",
    !hasService ? "Add at least one service component." : "",
    missingCost.length > 0 ? "Resolve missing component costs." : ""
  ].filter(Boolean);
  const canPublish = blockers.length === 0;

  function addSelectedComponent() {
    setComponentIds((current) => (current.includes(selectedComponentId) ? current : [...current, selectedComponentId]));
  }

  function removeComponent(id: string) {
    setComponentIds((current) => current.filter((componentId) => componentId !== id));
  }

  return (
    <div className="builder-layout">
      <section className="panel component-picker-panel" aria-labelledby="component-picker-heading">
        <div className="panel-header" id="component-picker-heading">
          Component picker
        </div>
        <div className="panel-body compact-stack">
          <label className="field-control">
            <span>Add component</span>
            <select
              aria-label="Component to add"
              value={selectedComponentId}
              onChange={(event) => setSelectedComponentId(event.target.value)}
            >
              {availableComponents.map((component) => (
                <option key={component.id} value={component.id}>
                  {component.label}
                </option>
              ))}
            </select>
          </label>
          <button className="button button-primary" type="button" onClick={addSelectedComponent}>
            Add selected component
          </button>
          <label className="field-control">
            <span>Quantity scale</span>
            <input
              aria-label="Quantity scale"
              min="1"
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="panel recipe-panel" aria-labelledby="recipe-heading">
        <div className="panel-header" id="recipe-heading">
          Recipe composition
        </div>
        <div className="panel-body">
          <table className="table dense-table responsive-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Type</th>
                <th>Unit cost</th>
                <th>State</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component) => (
                <tr key={component.id}>
                  <td data-label="Component">{component.label}</td>
                  <td data-label="Type">{component.type}</td>
                  <td data-label="Unit cost">{component.cost === null ? "Missing" : `$${component.cost.toFixed(2)}`}</td>
                  <td data-label="State">
                    <span className={component.cost === null ? "status status-danger" : "status status-success"}>
                      {component.cost === null ? "Invalid component" : "Priced"}
                    </span>
                  </td>
                  <td data-label="Action">
                    <button className="button button-secondary table-action" type="button" onClick={() => removeComponent(component.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="panel publish-panel" aria-label="Publish readiness">
        <div className="panel-header">Publish checklist</div>
        <div className="panel-body compact-stack">
          <div className="metric">
            <span className="metric-label">Scaled cost at {quantity} units</span>
            <span className="metric-value">${scaledCost.toFixed(2)}</span>
          </div>
          <ul className="checklist">
            <li data-complete={hasProduct}>Product component selected</li>
            <li data-complete={hasService}>Service component selected</li>
            <li data-complete={missingCost.length === 0}>All component costs resolved</li>
            <li data-complete={canPublish}>Publish-ready recipe</li>
          </ul>
          {blockers.length > 0 ? (
            <div className="margin-alert" role="alert">
              {blockers.join(" ")}
            </div>
          ) : (
            <div className="status-line status-success" role="status">
              Offering is ready to publish.
            </div>
          )}
          <button className="button button-primary sticky-action" disabled={!canPublish} type="button">
            Publish offering
          </button>
          <button className="button button-secondary" type="button">
            Archive draft
          </button>
        </div>
      </aside>
    </div>
  );
}
