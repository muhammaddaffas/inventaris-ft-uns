import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistem Inventaris FT UNS",
  description: "Sistem Manajemen Inventaris Fakultas Teknik Universitas Sebelas Maret",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${plusJakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-background antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
