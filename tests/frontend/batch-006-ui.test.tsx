import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuoteBuilder } from "@/ui/components/QuoteBuilder";
import { StatusCenter } from "@/ui/components/StatusCenter";

describe("QuoteBuilder", () => {
  it("shows readiness blockers and disables output and sharing controls", () => {
    render(<QuoteBuilder />);

    expect(screen.getByRole("status")).toHaveTextContent(/resolve pricing blockers/i);
    expect(screen.getByRole("alert")).toHaveTextContent(/needs a locked pricing snapshot/i);
    expect(screen.getByRole("button", { name: /approve quote/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /generate pdf/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create secure link/i })).toBeDisabled();
    expect(screen.getByText("Expired")).toBeInTheDocument();
    expect(screen.getByText("Revoked")).toBeInTheDocument();
  });

  it("allows keyboard quantity editing and enables generation when blockers are hidden", () => {
    render(<QuoteBuilder />);

    const quantityInput = screen.getByLabelText(/premium tee with front dtf quantity/i);
    fireEvent.change(quantityInput, { target: { value: "60" } });
    expect(quantityInput).toHaveValue(60);

    fireEvent.click(screen.getByRole("checkbox", { name: /show blocked lines/i }));
    expect(screen.getByText("Quote is ready for approval and output generation.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /approve quote/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /generate pdf/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /create secure link/i })).toBeEnabled();
  });
});

describe("StatusCenter", () => {
  it("keeps failed jobs visible and exposes retry eligibility", () => {
    render(<StatusCenter />);

    const failedRegion = screen.getByRole("region", { name: /failed jobs/i });
    expect(failedRegion).not.toBeNull();
    expect(within(failedRegion as HTMLElement).getByText("JOB-9821")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry job/i })).toBeEnabled();
  });

  it("shows keyboard-accessible job details without raw secrets", () => {
    render(<StatusCenter />);

    fireEvent.click(screen.getByRole("button", { name: "JOB-9819" }));
    expect(screen.getByText("SUP-1039")).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry job/i })).toBeDisabled();
    expect(document.body.textContent).not.toMatch(/sk-[A-Za-z0-9]/);
    expect(document.body.textContent).not.toMatch(/password=/i);
  });
});
