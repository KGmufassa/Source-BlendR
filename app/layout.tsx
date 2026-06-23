import type { Metadata } from "next";
import { WorkspaceShell } from "@/ui/components/WorkspaceShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Source-Blendr",
  description: "Supplier aggregation, pricing, and resale management workspace."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WorkspaceShell>{children}</WorkspaceShell>
      </body>
    </html>
  );
}
