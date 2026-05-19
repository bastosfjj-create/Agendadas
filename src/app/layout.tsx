import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RB Imóveis - Agendadas",
  description: "Gestão de visitas a imóveis de alto padrão no Rio de Janeiro.",
};

import { createClient } from '@/utils/supabase/server';
import { Sidebar } from './Sidebar';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from('perfis').select('cargo').eq('id', user.id).single();
    const perfil = data as { cargo: string } | null;
    isAdmin = perfil?.cargo === 'admin' || perfil?.cargo === 'gerente';
  }

  return (
    <html lang="pt-BR">
      <body className={`${montserrat.className} bg-dark-300 text-foreground antialiased min-h-screen flex`}>
        {user && <Sidebar isAdmin={isAdmin} />}
        <main className={`flex-1 w-full transition-all duration-300 overflow-x-hidden ${user ? 'lg:ml-64 p-4 sm:p-6 lg:p-8' : ''}`}>
          {children}
        </main>
      </body>
    </html>
  );
}
