import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkspaceShell } from "@/ui/components/WorkspaceShell";

describe("WorkspaceShell", () => {
  it("exposes core workspace navigation", () => {
    render(
      <WorkspaceShell>
        <div>Content</div>
      </WorkspaceShell>
    );

    expect(screen.getByRole("navigation", { name: /workspace navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /quotes/i })).toBeInTheDocument();
  });
});
