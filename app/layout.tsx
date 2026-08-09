import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusHub — Multi-College Notice Board",
  description: "Smart campus portal for Vignan, CBIT, and Anurag colleges — announcements, events, and student queries.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
