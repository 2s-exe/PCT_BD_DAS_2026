import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-expect-error CSS imports are handled by Next.js
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PCT UVCI — Gestion des heures d'enseignement",
  description: "Plateforme de gestion des activités pédagogiques et volumes horaires — Université Virtuelle de Côte d'Ivoire",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.variable} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
