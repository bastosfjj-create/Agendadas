import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FormCadastroUsuario } from './FormCadastroUsuario'

export default async function UsuariosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verifica se é admin
  if (user.email !== 'bastosfjj@gmail.com') {
    redirect('/')
  }

  // Buscar equipe existente
  const response = await supabase.from('perfis').select('*').order('nome', { ascending: true });
  const equipe = response.data as { id: string, nome: string | null, email: string, cargo: string }[] | null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-light tracking-tight">
          <span className="font-semibold text-primary">Gestão</span> de Equipe
        </h1>
        <p className="text-gray-400 mt-1">Cadastre e gerencie os acessos do sistema.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-dark-200 border border-dark-100 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-4">Novo Membro</h2>
            <FormCadastroUsuario />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-dark-200 border border-dark-100 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-4">Equipe Cadastrada</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-100">
                    <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">Nome</th>
                    <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">E-mail</th>
                    <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">Cargo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {equipe?.map((membro) => (
                    <tr key={membro.id} className="hover:bg-dark-300/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-white font-medium">{membro.nome || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{membro.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          membro.cargo === 'admin' 
                            ? 'bg-primary/10 border-primary/20 text-primary' 
                            : 'bg-dark-100 border-dark-100 text-gray-300'
                        }`}>
                          {membro.cargo === 'admin' ? 'Gerente' : 'Corretor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!equipe || equipe.length === 0) && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500 text-sm">Nenhum membro cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
