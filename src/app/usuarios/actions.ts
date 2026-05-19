/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function criarUsuario(formData: FormData) {
  const nome = formData.get('nome') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const cargo = formData.get('cargo') as string;

  if (!nome || !email || !password || !cargo) {
    return { error: 'Todos os campos são obrigatórios' };
  }

  // Criar Auth User ignorando email de confirmação (se permitido nas configs do Supabase)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { nome }
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
     return { error: 'Erro desconhecido ao criar auth user' };
  }

  const userId = authData.user.id;

  // Inserir no perfis
  const { error: profileError } = await supabaseAdmin.from('perfis').insert({
    id: userId,
    email: email,
    nome: nome,
    cargo: cargo
  } as any);

  if (profileError) {
    return { error: 'Erro ao salvar perfil: ' + profileError.message };
  }

  revalidatePath('/usuarios');
  return { success: true };
}
