"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Status = "Agendada" | "Realizada" | "Reagendada" | "Desmarcada";

interface Agendamento {
  id: string;
  data: string;
  dataOriginal?: string;
  horario: string;
  cliente_nome: string;
  imovel: string;
  corretor: string;
  statusManual?: "Desmarcada" | "Reagendada";
}

const formatarData = (dataStr: string) => {
  if (!dataStr) return "";
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
};

const calcularStatus = (agendamento: Agendamento): Status => {
  if (agendamento.statusManual) return agendamento.statusManual;
  if (agendamento.dataOriginal && agendamento.data !== agendamento.dataOriginal) return "Reagendada";
  
  const hoje = new Date();
  const dataVisita = new Date(`${agendamento.data}T${agendamento.horario}`);
  
  if (dataVisita > hoje) return "Agendada";
  return "Realizada";
};

const statusStyles: Record<Status, string> = {
  Realizada: "bg-green-500/10 text-green-500 border-green-500/20",
  Agendada: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Reagendada: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Desmarcada: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function FunilPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('agendamentos')
          .select('*')
          .order('data', { ascending: false })
          .order('horario', { ascending: false });

        if (error) throw error;
        setAgendamentos((data as unknown as Agendamento[]) || []);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetch();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-light tracking-tight">
          Visitas <span className="font-semibold text-primary">(Funil)</span>
        </h1>
        <p className="text-gray-400 mt-1">Histórico completo de todos os agendamentos cadastrados.</p>
      </div>

      <div className="bg-dark-200 border border-dark-100 rounded-xl p-6 shadow-sm">
        {isLoading ? (
          <div className="py-12 text-center text-gray-500 bg-dark-300/50 rounded-xl border border-dark-100 border-dashed animate-pulse">
            Carregando agendamentos...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-100">
                  <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">Data</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">Horário</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">Cliente</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">Imóvel</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">Corretor</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {agendamentos.map((agendamento) => {
                  const statusAtual = calcularStatus(agendamento);
                  return (
                    <tr key={agendamento.id} className="hover:bg-dark-300/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-white font-medium">{formatarData(agendamento.data)}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{agendamento.horario}</td>
                      <td className="py-3 px-4 text-sm text-white font-medium">{agendamento.cliente_nome}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{agendamento.imovel}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{agendamento.corretor}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${statusStyles[statusAtual]}`}>
                          {statusAtual}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {agendamentos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">Nenhum agendamento encontrado no banco de dados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
