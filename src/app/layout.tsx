import "@/app/globals.css";
import { ReactNode } from "react";
import { Providers } from "@/app/providers";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Narrativas Chronoscribe",
  description:
    "Modele narrativas com o Meta-Agente L5: arquitetura estratégica para conteúdo multimídia.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'bg-blue-950 text-amber-400 border border-blue-800',
              duration: 3000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
