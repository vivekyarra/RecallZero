import type { Metadata } from "next";
import "./globals.css";
import "./responsive-fixes.css";

export const metadata: Metadata = {
  title: "RecallZero — Your household safety autopilot",
  description:
    "RecallZero verifies product recalls and completes governed remedy workflows until they are resolved.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
