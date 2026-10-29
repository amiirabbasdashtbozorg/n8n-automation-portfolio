import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUT Academic Copilot",
  description: "دستیار هوشمند آیین‌نامه‌های آموزشی دانشگاه صنعتی شریف"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
