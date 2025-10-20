import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";

// Using Geist font package classes directly (no function calls)

export const metadata: Metadata = {
  title: "Kateri Pharmacy",
  description: "Professional pharmacy services with online ordering",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/hero-bg.png" />
      </head>
      <body className={`${GeistSans.className} ${GeistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
