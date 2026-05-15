import { createBrowserClient } from '@supabase/ssr';

export interface Database {
  public: {
    Tables: {
      agendamentos: {
        Row: {
          id: string;
          created_at: string;
          cliente_nome: string;
          whatsapp: string;
          imovel: string;
          tipo: string;
          data: string;
          horario: string;
          corretor: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          cliente_nome: string;
          whatsapp: string;
          imovel: string;
          tipo: string;
          data: string;
          horario: string;
          corretor: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          cliente_nome?: string;
          whatsapp?: string;
          imovel?: string;
          tipo?: string;
          data?: string;
          horario?: string;
          corretor?: string;
        };
      };
      perfis: {
        Row: {
          id: string;
          email: string;
          cargo: string;
          nome: string | null;
        };
        Insert: {
          id: string;
          email: string;
          cargo?: string;
          nome?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          cargo?: string;
          nome?: string | null;
        };
      };
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
