import assert from "node:assert/strict";
import test from "node:test";

import {
  APP_ROUTES,
  DESIGN_TOKENS,
  renderAppShell,
  sharedComponents,
} from "./src/app-shell.js";

test("app shell exposes approved routes and shared status states", () => {
  assert.equal(APP_ROUTES.length, 16);
  assert.equal(APP_ROUTES[0].path, "/app");
  assert.equal(APP_ROUTES.at(-1).path, "/app/settings/ai");
  assert.deepEqual(sharedComponents.StatusBadge.states, [
    "loading",
    "empty",
    "populated",
    "saving",
    "success",
    "error",
    "permission_denied",
  ]);
});

test("app shell renders design tokens and accessible navigation", () => {
  const html = renderAppShell({
    activePath: "/app/catalog",
    workspaceName: "Demo Workspace",
  });

  assert.match(html, /--sb-canvas: #F7F6F2/);
  assert.match(html, /aria-label="Primary workspace navigation"/);
  assert.match(html, /aria-current="page">Catalog/);
  assert.equal(DESIGN_TOKENS.color.action, "#A85E2A");
});
