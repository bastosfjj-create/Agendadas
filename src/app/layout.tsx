import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RB Imóveis - Agendadas",
  description: "Gestão de visitas a imóveis de alto padrão no Rio de Janeiro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.className} bg-dark-300 text-foreground antialiased min-h-screen flex flex-col`}>
        <nav className="fixed top-0 w-full bg-dark-200 border-b border-dark-100 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-primary font-bold text-xl tracking-wider">Equipe Rangel Jr.</span>
                <span className="ml-2 text-gray-400 font-light">| Agendadas</span>
              </Link>
              <Link 
                href="/novo" 
                className="bg-primary hover:bg-primary-dark text-navy px-4 py-2 rounded-md font-semibold text-sm transition-colors shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              >
                + Nova Visita
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 mt-16 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
