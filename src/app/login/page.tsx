import { login } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f18] text-white p-4 font-sans">
      <div className="w-full max-w-md bg-[#131b26] border border-[#1c2635] p-8 rounded-xl shadow-2xl relative overflow-hidden">
        {/* Glow Decorativo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d4af37]/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#d4af37]/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2">
              <span className="font-semibold text-[#d4af37]">Agendadas</span>
            </h1>
            <p className="text-gray-400 text-sm">Entre com suas credenciais de acesso</p>
          </div>

          {searchParams?.error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center font-medium">
              E-mail ou senha incorretos.
            </div>
          )}

          <form className="space-y-5">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold" htmlFor="email">E-mail</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="seu@email.com"
                required 
                className="w-full bg-[#1c2635]/50 border border-[#1c2635] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold" htmlFor="password">Senha</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="w-full bg-[#1c2635]/50 border border-[#1c2635] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-gray-600"
              />
            </div>
            
            <button 
              formAction={login} 
              className="w-full bg-[#d4af37] text-[#0a0f18] font-bold py-3 mt-4 rounded-lg hover:bg-[#c29b2b] transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:-translate-y-0.5"
            >
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
