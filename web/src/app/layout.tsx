import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/lib/state/AppStateProvider";
import { AppShell } from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "APProved",
  description: "Regulatory & medical affairs submission platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <AppStateProvider>
          <AppShell>{children}</AppShell>
        </AppStateProvider>
      </body>
    </html>
  );
}
