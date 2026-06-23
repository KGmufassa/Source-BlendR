import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BundleRecipeBuilder } from "@/ui/components/BundleRecipeBuilder";
import { PricingWorkspace } from "@/ui/components/PricingWorkspace";

describe("PricingWorkspace", () => {
  it("shows cost, price, margin, and approval blockers together", () => {
    render(<PricingWorkspace />);

    expect(screen.getByText("Approval required before publishing.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/low margin/i);
    expect(screen.getByText("Missing costs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /approve price/i })).toBeDisabled();
    expect(screen.getByText("Audit timeline")).toBeInTheDocument();
  });

  it("clears blockers when margin and component costs are valid", () => {
    render(<PricingWorkspace />);

    fireEvent.click(screen.getByLabelText(/include component with missing cost/i));
    fireEvent.change(screen.getByLabelText(/target margin percent/i), {
      target: { value: "45" }
    });

    expect(screen.getByText("Pricing is approved for publishing.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /approve price/i })).toBeEnabled();
  });
});

describe("BundleRecipeBuilder", () => {
  it("shows invalid components and blocks publish until costs are resolved", () => {
    render(<BundleRecipeBuilder />);

    expect(screen.getByRole("alert")).toHaveTextContent(/resolve missing component costs/i);
    expect(screen.getByText("Invalid component")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /publish offering/i })).toBeDisabled();
  });

  it("supports non-pointer component removal and publish readiness", () => {
    render(<BundleRecipeBuilder />);

    const artworkRow = screen.getAllByText("Artwork cleanup").find((element) => element.closest("tr"))?.closest("tr");
    expect(artworkRow).not.toBeNull();
    fireEvent.click(within(artworkRow as HTMLTableRowElement).getByRole("button", { name: /remove/i }));

    expect(screen.getByText("Offering is ready to publish.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /publish offering/i })).toBeEnabled();

    fireEvent.change(screen.getByLabelText(/component to add/i), {
      target: { value: "packaging" }
    });
    fireEvent.click(screen.getByRole("button", { name: /add selected component/i }));

    expect(screen.getAllByText("Poly bag packaging").some((element) => element.closest("tr"))).toBe(true);
  });
});
