'use client'

import { useRef, useState } from 'react'
import { criarUsuario } from './actions'

export function FormCadastroUsuario() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string, type: 'error' | 'success' } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setMsg(null)
    
    const res = await criarUsuario(formData)
    
    if (res.error) {
      setMsg({ text: res.error, type: 'error' })
    } else if (res.success) {
      setMsg({ text: 'Usuário criado com sucesso!', type: 'success' })
      formRef.current?.reset()
    }
    setLoading(false)
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-4">
      {msg && (
        <div className={`p-3 rounded-lg text-sm font-medium border ${
          msg.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
        }`}>
          {msg.text}
        </div>
      )}
      
      <div>
        <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Nome</label>
        <input 
          name="nome" 
          type="text" 
          required 
          className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">E-mail</label>
        <input 
          name="email" 
          type="email" 
          required 
          className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Senha (Temporária)</label>
        <input 
          name="password" 
          type="text" 
          required 
          className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Cargo</label>
        <select 
          name="cargo" 
          required
          defaultValue="corretor"
          className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
        >
          <option value="corretor">Corretor</option>
          <option value="admin">Gerente</option>
        </select>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-primary text-navy font-bold py-2.5 rounded-lg hover:bg-primary-dark transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {loading ? 'Cadastrando...' : 'Cadastrar Membro'}
      </button>
    </form>
  )
}
