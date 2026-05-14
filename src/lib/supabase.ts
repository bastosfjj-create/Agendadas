import { createClient } from '@supabase/supabase-js';

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
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
