'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export function FormCadastroUsuario() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string, type: 'error' | 'success' } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    
    const formData = new FormData(e.currentTarget)
    const nome = formData.get('nome')
    const email = formData.get('email')
    const password = formData.get('password')
    const cargo = formData.get('cargo')
    
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password, cargo })
      })
      
      const res = await response.json()

      if (!response.ok || res.error) {
        setMsg({ text: res.error || 'Erro ao cadastrar', type: 'error' })
      } else if (res.success) {
        setMsg({ text: 'Usuário criado com sucesso!', type: 'success' })
        formRef.current?.reset()
        router.refresh()
      }
    } catch {
      setMsg({ text: 'Erro de conexão com o servidor', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
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
