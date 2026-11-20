import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { siteName } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400" });

export function generateMetadata(): Metadata {
  const name = siteName();
  return {
    title: { default: `${name} — Catalog`, template: `%s · ${name}` },
    description: `Browse the ${name} catalog and send an inquiry about any piece.`,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
