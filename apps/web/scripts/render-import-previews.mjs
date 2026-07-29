import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  renderDiscoverySessionPage,
  renderPdfImportPage,
  renderTicket017PreviewPage,
  renderWebsiteImportPage,
} from "../src/import-workflows.js";

const WEB_DIR = dirname(dirname(fileURLToPath(import.meta.url)));

const vendors = [{ id: "vendor-1", name: "Acme Foods" }];

const previews = Object.freeze([
  {
    file: "website-import-preview.html",
    html: renderWebsiteImportPage({ vendors, categories: ["Tea", "Coffee"], jobId: "job-website-1" }),
  },
  {
    file: "pdf-import-preview.html",
    html: renderPdfImportPage({ vendors, jobId: "job-pdf-1", state: "error" }),
  },
  {
    file: "discovery-session-preview.html",
    html: renderDiscoverySessionPage({
      candidates: [
        { id: "cand-1", name: "Jasmine Tea", status: "ready" },
        { id: "cand-2", name: "House Espresso", status: "needs_review" },
      ],
    }),
  },
  {
    file: "import-workspace-preview.html",
    html: renderTicket017PreviewPage({ jobId: "job-1", sessionId: "session-1" }),
  },
]);

await Promise.all(previews.map((preview) => writeFile(join(WEB_DIR, preview.file), preview.html, "utf-8")));
