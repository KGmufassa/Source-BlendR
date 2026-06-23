import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssetLibrary } from "@/ui/components/AssetLibrary";
import { ImportReviewWizard } from "@/ui/components/ImportReviewWizard";

describe("ImportReviewWizard", () => {
  it("keeps commit disabled with an explanation until mapping prerequisites are met", () => {
    render(<ImportReviewWizard />);

    const commitButton = screen.getByRole("button", { name: /commit valid assets/i });
    expect(commitButton).toBeDisabled();
    expect(screen.getByText(/commit is disabled until unit cost is mapped/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/unit cost source column/i), {
      target: { value: "Cost" }
    });

    expect(screen.getByText(/one row remains excluded from commit/i)).toBeInTheDocument();
    expect(commitButton).toBeEnabled();
  });

  it("renders text-labeled row errors and an error report action", () => {
    render(<ImportReviewWizard />);

    expect(screen.getByRole("link", { name: /download error report/i })).toBeInTheDocument();
    expect(screen.getByText("SKU is required.")).toBeInTheDocument();
    expect(screen.getByText("Unit cost must be mapped before commit.")).toBeInTheDocument();
  });
});

describe("AssetLibrary", () => {
  it("shows supplier provenance, missing costs, archived state, and detail actions", () => {
    render(<AssetLibrary />);

    expect(screen.getAllByText("Acme Blanks").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Missing costs").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Archived")[0]).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to bundle/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /archive/i })).toBeInTheDocument();
  });

  it("filters assets by missing cost state", () => {
    render(<AssetLibrary />);

    fireEvent.change(screen.getByLabelText(/state/i), {
      target: { value: "missing_costs" }
    });

    const table = screen.getByRole("table");
    expect(within(table).getByText("Left chest embroidery")).toBeInTheDocument();
    expect(within(table).queryByText("Pullover Hoodie")).not.toBeInTheDocument();
  });
});
