import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const fonteSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--fonte-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Estoque de carnes",
  description: "Gestão de estoque de carnes: entradas, retiradas e contagem.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={fonteSans.variable}>
      <body>{children}</body>
    </html>
  );
}
