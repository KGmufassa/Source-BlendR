"use client";

import { useMemo, useState } from "react";

const assets = [
  {
    id: "asset-001",
    type: "Product",
    name: "Pullover Hoodie",
    supplier: "Acme Blanks",
    sku: "HOODIE-001",
    cost: "$18.50",
    readiness: "Ready",
    status: "Active",
    tags: ["Apparel", "Fleece"]
  },
  {
    id: "asset-002",
    type: "Service",
    name: "Left chest embroidery",
    supplier: "Decoration Partner",
    sku: "EMB-LC",
    cost: "Missing",
    readiness: "Missing costs",
    status: "Active",
    tags: ["Embroidery"]
  },
  {
    id: "asset-003",
    type: "Product",
    name: "Structured Cap",
    supplier: "Acme Blanks",
    sku: "CAP-001",
    cost: "$7.25",
    readiness: "Ready",
    status: "Archived",
    tags: ["Headwear"]
  }
];

export function AssetLibrary() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("asset-001");
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesQuery = [asset.name, asset.supplier, asset.sku].some((value) =>
        value.toLowerCase().includes(query.toLowerCase())
      );
      const matchesFilter =
        filter === "all" ||
        (filter === "missing_costs" && asset.readiness === "Missing costs") ||
        (filter === "archived" && asset.status === "Archived");

      return matchesQuery && matchesFilter;
    });
  }, [filter, query]);
  const selectedAsset = assets.find((asset) => asset.id === selectedId) ?? filteredAssets[0] ?? assets[0];

  return (
    <div className="asset-layout">
      <section className="panel asset-table-panel" aria-labelledby="asset-list-heading">
        <div className="filter-bar">
          <label className="field-control search-control">
            <span>Search assets</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by SKU, supplier, or name" />
          </label>
          <label className="field-control">
            <span>State</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">All assets</option>
              <option value="missing_costs">Missing costs</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        <div className="panel-header" id="asset-list-heading">
          Assets
        </div>
        <div className="panel-body">
          <table className="table dense-table responsive-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Supplier</th>
                <th>Cost readiness</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id}>
                  <td data-label="Asset">
                    <button className="link-button" type="button" onClick={() => setSelectedId(asset.id)}>
                      {asset.name}
                    </button>
                    <div className="muted">{asset.sku}</div>
                  </td>
                  <td data-label="Type">
                    <span className="status status-info">{asset.type}</span>
                  </td>
                  <td data-label="Supplier">{asset.supplier}</td>
                  <td data-label="Cost readiness">
                    <span className={asset.readiness === "Ready" ? "status status-success" : "status status-warning"}>
                      {asset.readiness}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={asset.status === "Archived" ? "status status-danger" : "status status-success"}>
                      {asset.status}
                    </span>
                  </td>
                  <td data-label="Action">
                    <button className="button button-secondary table-action" type="button">
                      Add to quote
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAssets.length === 0 ? <div className="empty-state">No assets match the current filters.</div> : null}
        </div>
      </section>

      <aside className="panel detail-drawer" aria-label="Asset detail">
        <div className="panel-header">Asset detail</div>
        <div className="panel-body compact-stack">
          <div>
            <h2 className="drawer-title">{selectedAsset.name}</h2>
            <p className="muted">{selectedAsset.sku}</p>
          </div>
          <dl className="summary-list vertical">
            <div>
              <dt>Supplier provenance</dt>
              <dd>{selectedAsset.supplier}</dd>
            </div>
            <div>
              <dt>Cost readiness</dt>
              <dd>{selectedAsset.readiness}</dd>
            </div>
            <div>
              <dt>State</dt>
              <dd>{selectedAsset.status}</dd>
            </div>
            <div>
              <dt>Tags</dt>
              <dd>{selectedAsset.tags.join(", ")}</dd>
            </div>
          </dl>
          {selectedAsset.readiness === "Missing costs" ? (
            <div className="status-line status-warning">Missing cost blocks margin preview until resolved.</div>
          ) : null}
          {selectedAsset.status === "Archived" ? (
            <div className="status-line status-danger">Archived asset is hidden from new quote recommendations.</div>
          ) : null}
          <div className="button-row">
            <button className="button button-primary" type="button">
              Add to bundle
            </button>
            <button className="button button-secondary" type="button">
              Tag
            </button>
            <button className="button button-secondary" type="button">
              Archive
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
