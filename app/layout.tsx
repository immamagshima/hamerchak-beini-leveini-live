import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "המרחק ביני לביני",
  description: "מפת נקודה בזמן, קרן בן עמי | אמא מגשימה",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
