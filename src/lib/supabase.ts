import { createClient } from '@supabase/supabase-js';

// Definição dos tipos do banco de dados (tabela Agendamentos)
export type Agendamento = {
  id: string;
  created_at: string;
  client_name: string;
  client_whatsapp: string;
  property: string;
  visit_type: string;
  visit_date: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'REALIZADO';
  user_id?: string; // Relacionamento opcional com corretor
};

export interface Database {
  public: {
    Tables: {
      agendamentos: {
        Row: Agendamento;
        Insert: Omit<Agendamento, 'id' | 'created_at'>;
        Update: Partial<Omit<Agendamento, 'id' | 'created_at'>>;
      };
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
