import type { ReactNode } from "react";
import "./globals.css";
import { AuthSessionProvider } from "@/components/session-provider";

export const metadata = {
  title: "Narrativas Chronoscribe",
  description: "Arquiteto de Narrativas IA",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
