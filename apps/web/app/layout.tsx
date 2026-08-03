import type { Metadata } from "next";
import "./globals.css";
import { WorkspaceShell } from "./workspace-shell";

export const metadata: Metadata = {
  title: "Source BlendR",
  description: "Vendor intelligence and catalog workspace",
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
