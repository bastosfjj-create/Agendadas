/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { nome, email, password, cargo } = await request.json();

    if (!nome || !email || !password || !cargo) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase Env Variables.");
      return NextResponse.json({ error: 'Erro de configuração do servidor: Chave Mestra não encontrada.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { nome }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Erro desconhecido ao criar auth user' }, { status: 500 });
    }

    const userId = authData.user.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await supabaseAdmin.from('perfis').insert({
      id: userId,
      email: email,
      nome: nome,
      cargo: cargo
    } as any);

    if (profileError) {
      return NextResponse.json({ error: 'Erro ao salvar perfil: ' + profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro interno no servidor: ' + err.message }, { status: 500 });
  }
}
