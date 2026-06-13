import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "PCT UVCI Gestion des heures d'enseignement",
  description: "Plateforme de gestion des activités pédagogiques et volumes horaires — Université Virtuelle de Côte d'Ivoire",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
