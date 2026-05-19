"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CORRETORES } from "../../lib/constants";
import { supabase } from "@/lib/supabase";

export default function NovaVisita() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: "",
    imovel: "",
    data: "",
    hora: "",
    corretor: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCargo, setUserCargo] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
      } else {
        const { data } = await supabase.from('perfis').select('cargo, nome').eq('id', user.id).single();
        const perfil = data as { cargo: string, nome: string } | null;
        if (perfil) {
          setUserCargo(perfil.cargo);
          if (perfil.cargo === 'corretor') {
            setFormData(prev => ({ ...prev, corretor: perfil.nome || user.email || "" }));
          }
        }
      }
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('agendamentos').insert([
        {
          cliente_nome: formData.nome,
          imovel: formData.imovel,
          data: formData.data,
          horario: formData.hora,
          corretor: formData.corretor
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any);

      if (error) throw error;

      alert("Visita agendada com sucesso!");
      router.push("/");
    } catch (error) {
      console.error("Erro ao agendar visita:", error);
      alert("Erro ao agendar visita. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/" 
          className="p-2 rounded-full hover:bg-dark-200 transition-colors text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-light tracking-tight">
            Nova <span className="font-semibold text-primary">Visita</span>
          </h1>
          <p className="text-gray-400 mt-1">Cadastre um novo agendamento</p>
        </div>
      </div>

      <div className="bg-dark-200 rounded-xl border border-dark-100 p-6 md:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300">
              Nome do Cliente
            </label>
            <input
              type="text"
              id="nome"
              required
              className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-gray-600"
              placeholder="Ex: Roberto Marinho"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="imovel" className="block text-sm font-medium text-gray-300">
              Imóvel de Interesse
            </label>
            <select
              id="imovel"
              required
              className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
              value={formData.imovel}
              onChange={(e) => setFormData({ ...formData, imovel: e.target.value })}
            >
              <option value="" disabled className="text-gray-600">Selecione o imóvel</option>
              <option value="Alma Ipanema">Alma Ipanema</option>
              <option value="Pura">Pura</option>
              <option value="Endless">Endless</option>
              <option value="Ilha Pura">Ilha Pura</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="data" className="block text-sm font-medium text-gray-300">
                Data da Visita
              </label>
              <input
                type="date"
                id="data"
                required
                className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all [&::-webkit-calendar-picker-indicator]:invert"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="hora" className="block text-sm font-medium text-gray-300">
                Horário
              </label>
              <input
                type="time"
                id="hora"
                required
                className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all [&::-webkit-calendar-picker-indicator]:invert"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              />
            </div>
          </div>

          {userCargo !== 'corretor' && (
            <div className="space-y-2">
              <label htmlFor="corretor" className="block text-sm font-medium text-gray-300">
                Corretor Responsável
              </label>
              <select
                id="corretor"
                required
                className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                value={formData.corretor}
                onChange={(e) => setFormData({ ...formData, corretor: e.target.value })}
              >
                <option value="" disabled className="text-gray-600">Selecione o corretor</option>
                {CORRETORES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-primary hover:bg-primary-dark text-navy font-bold py-4 rounded-lg transition-all duration-300 shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_6px_20px_rgba(212,175,55,0.23)] hover:-translate-y-0.5'}`}
            >
              {isSubmitting ? 'Aguarde...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
