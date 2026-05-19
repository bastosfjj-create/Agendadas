"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Calendar, Clock, User, Building, FileText } from "lucide-react";
import { CORRETORES } from "../lib/constants";
import { supabase } from "@/lib/supabase";

type Status = "Agendada" | "Realizada" | "Reagendada" | "Desmarcada";

const formatarData = (dataStr: string) => {
  if (!dataStr) return "";
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
};

interface Agendamento {
  id: string;
  data: string;
  dataOriginal?: string;
  horario: string;
  cliente_nome: string;
  whatsapp?: string;
  imovel: string;
  corretor: string;
  tipo: string;
  status: string;
  statusManual?: "Desmarcada" | "Reagendada";
}

const statusStyles: Record<Status, string> = {
  Realizada: "bg-green-500/10 text-green-500 border-green-500/20",
  Agendada: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Reagendada: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Desmarcada: "bg-red-500/10 text-red-500 border-red-500/20",
};

const isDateInNextWeek = (dateStr: string) => {
  const date = new Date(`${dateStr}T12:00:00`);
  const today = new Date();
  const startOfNextWeek = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1) + 7;
  startOfNextWeek.setDate(diff);
  startOfNextWeek.setHours(0,0,0,0);
  
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
  endOfNextWeek.setHours(23,59,59,999);
  
  return date >= startOfNextWeek && date <= endOfNextWeek;
}

const calcularIntervaloDatas = (periodo: string, inicioManual: string, fimManual: string) => {
  const hoje = new Date();
  let inicio = new Date(hoje);
  let fim = new Date(hoje);

  const formatYYYYMMDD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  if (periodo === "ProximaSemana") {
    let diasAteSabado = 6 - hoje.getDay();
    if (diasAteSabado <= 0) diasAteSabado += 7;
    
    inicio.setDate(hoje.getDate() + diasAteSabado);
    inicio.setHours(0, 0, 0, 0);

    fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 6);
    fim.setHours(23, 59, 59, 999);
    return { inicio: formatYYYYMMDD(inicio), fim: formatYYYYMMDD(fim) };
  } else if (periodo === "Mês") {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    return { inicio: formatYYYYMMDD(inicio), fim: formatYYYYMMDD(fim) };
  } else if (periodo === "Semestre") {
    const semestre = Math.floor(hoje.getMonth() / 6);
    inicio = new Date(hoje.getFullYear(), semestre * 6, 1);
    fim = new Date(hoje.getFullYear(), (semestre + 1) * 6, 0);
    return { inicio: formatYYYYMMDD(inicio), fim: formatYYYYMMDD(fim) };
  } else if (periodo === "Ano") {
    inicio = new Date(hoje.getFullYear(), 0, 1);
    fim = new Date(hoje.getFullYear(), 11, 31);
    return { inicio: formatYYYYMMDD(inicio), fim: formatYYYYMMDD(fim) };
  } else if (periodo === "Manual") {
    return { inicio: inicioManual || null, fim: fimManual || null };
  }
  
  return { inicio: null, fim: null };
};

const getProximaSegundaStr = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 7;
  const proximaSegunda = new Date(d);
  proximaSegunda.setDate(diff);
  return proximaSegunda.toISOString().split('T')[0];
};

const calcularStatus = (agendamento: Agendamento): Status => {
  if (agendamento.statusManual) return agendamento.statusManual;
  if (agendamento.dataOriginal && agendamento.data !== agendamento.dataOriginal) return "Reagendada";
  
  const hoje = new Date();
  const dataVisita = new Date(`${agendamento.data}T${agendamento.horario}`);
  
  if (dataVisita > hoje) return "Agendada";
  return "Realizada";
};

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("Todas");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [filtroCorretor, setFiltroCorretor] = useState<string>("");
  const [filtroEmpreendimento, setFiltroEmpreendimento] = useState<string>("");

  const [usuarioLogado, setUsuarioLogado] = useState<string>("");
  const [cargoReal, setCargoReal] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userId, setUserId] = useState<string>("");

  const [listaCorretoresDb, setListaCorretoresDb] = useState<string[]>([]);
  const [corretoresConfirmados, setCorretoresConfirmados] = useState<string[]>([]);
  const [jaConfirmou, setJaConfirmou] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchUserAndCargo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const response = await supabase.from('perfis').select('cargo, nome').eq('id', user.id).single();
        const perfil = response.data as { cargo: string, nome: string } | null;
        
        if (perfil?.cargo === 'admin' || perfil?.cargo === 'gerente') {
           setCargoReal(perfil?.cargo);
           setUsuarioLogado('Gerente');
        } else {
           setCargoReal('corretor');
           setUsuarioLogado(perfil?.nome || user.email || ""); 
        }
      } else {
        window.location.href = '/login';
      }
      setIsLoadingUser(false);
    };
    fetchUserAndCargo();
  }, []);

  useEffect(() => {
    if (isLoadingUser) return;
    const fetchAgendamentos = async () => {
      setIsLoading(true);
      try {
        const hoje = new Date();
        const sabadoAtual = new Date(hoje);
        
        // Se hoje já for sábado, getDay() === 6. Caso contrário, subtrai dias até encontrar o Sábado passado.
        while (sabadoAtual.getDay() !== 6) {
          sabadoAtual.setDate(sabadoAtual.getDate() - 1);
        }
        
        const ano = sabadoAtual.getFullYear();
        const mes = String(sabadoAtual.getMonth() + 1).padStart(2, '0');
        const dia = String(sabadoAtual.getDate()).padStart(2, '0');
        const sabadoAtualStr = `${ano}-${mes}-${dia}`;

        let query = supabase.from('agendamentos')
          .select('*')
          .gte('data', sabadoAtualStr)
          .order('data', { ascending: true })
          .order('horario', { ascending: true });

        if (cargoReal === 'corretor' && usuarioLogado) {
          query = query.eq('corretor', usuarioLogado);
        }

        if (filtroPeriodo !== "Todas") {
          const { inicio, fim } = calcularIntervaloDatas(filtroPeriodo, dataInicio, dataFim);
          if (inicio) query = query.gte('data', inicio);
          if (fim) query = query.lte('data', fim);
        }

        if (filtroCorretor.trim() !== "") {
          query = query.ilike('corretor', `%${filtroCorretor}%`);
        }

        if (filtroEmpreendimento.trim() !== "") {
          query = query.ilike('imovel', `%${filtroEmpreendimento}%`);
        }

        const result = await query;
        const data = (result.data as unknown as Agendamento[]) || [];
        const error = result.error;
        
        console.log("Dados do Supabase:", data);
        
        if (error) throw error;
        
        setAgendamentos(data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgendamentos();
  }, [filtroPeriodo, dataInicio, dataFim, filtroCorretor, filtroEmpreendimento, cargoReal, usuarioLogado, isLoadingUser]);
  

  
  const [simularSexta, setSimularSexta] = useState(false);

  const isSextaFeiraJanela = () => {
    if (simularSexta) return true;
    const now = new Date();
    return now.getDay() === 5 && now.getHours() >= 17;
  };

  const fetchFechamentos = async () => {
    const refDateStr = getProximaSegundaStr();
    
    const { data: fechamentos } = await supabase.from('fechamento_semanal').select('*').eq('data_referencia', refDateStr);
    const confirmados = (fechamentos || []).map(f => f.nome);
    setCorretoresConfirmados(confirmados);

    if (cargoReal === 'corretor') {
       setJaConfirmou(confirmados.includes(usuarioLogado));
    } else {
       const { data: perfis } = await supabase.from('perfis').select('nome').eq('cargo', 'corretor');
       const nomesCorretores = (perfis || []).map(p => p.nome).filter(Boolean) as string[];
       setListaCorretoresDb(nomesCorretores);
    }
  };

  useEffect(() => {
    if (isLoadingUser || !cargoReal) return;
    if (simularSexta || isSextaFeiraJanela()) {
      fetchFechamentos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingUser, cargoReal, usuarioLogado, simularSexta]);

  const confirmarAgenda = async () => {
    setIsConfirming(true);
    const refDateStr = getProximaSegundaStr();

    const { error } = await supabase.from('fechamento_semanal').insert({
      corretor_id: userId,
      nome: usuarioLogado,
      data_referencia: refDateStr
    });

    if (!error) {
      setJaConfirmou(true);
      alert("Agenda confirmada com sucesso para a gerência!");
      fetchFechamentos();
    } else {
      console.error(error);
      alert("Erro ao confirmar agenda.");
    }
    setIsConfirming(false);
  };

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleData, setRescheduleData] = useState("");
  const [rescheduleHora, setRescheduleHora] = useState("");



  const desmarcarVisita = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, statusManual: "Desmarcada" } : a
    ));
  };

  const abrirModalReagendamento = (agendamento: Agendamento) => {
    setRescheduleId(agendamento.id);
    setRescheduleData(agendamento.data);
    setRescheduleHora(agendamento.horario);
    setIsRescheduleModalOpen(true);
  };

  const confirmarReagendamento = () => {
    if (!rescheduleId || !rescheduleData || !rescheduleHora) return;

    setAgendamentos(prev => {
      const updated = prev.map(a => {
        if (a.id === rescheduleId) {
          return {
            ...a,
            dataOriginal: a.dataOriginal || a.data,
            data: rescheduleData,
            horario: rescheduleHora,
            statusManual: "Reagendada" as const
          };
        }
        return a;
      });
      
      return updated.sort((a, b) => {
        const dataA = new Date(`${a.data}T${a.horario}`);
        const dataB = new Date(`${b.data}T${b.horario}`);
        return dataA.getTime() - dataB.getTime();
      });
    });

    setIsRescheduleModalOpen(false);
    setRescheduleId(null);
  };

  const gerarPdfDiretoria = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.text("Relatório Consolidado - Diretoria | Equipe Rangel Jr. | Lopes Rio", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.text("Período: Próxima Semana | Apenas Consultores Confirmados", 14, 28);

    const filtradosDiretoria = agendamentos.filter(a => {
      if (!isDateInNextWeek(a.data)) return false;
      if (!corretoresConfirmados.includes(a.corretor)) return false;
      if (calcularStatus(a) === "Desmarcada") return false;
      return true;
    });

    const tableData = filtradosDiretoria.map(a => [
      formatarData(a.data),
      a.horario.slice(0, 5),
      a.corretor,
      a.cliente_nome,
      a.imovel,
      calcularStatus(a)
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Data", "Horário", "Corretor", "Cliente", "Imóvel", "Status"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [212, 175, 55] },
      didParseCell: function (data) {
        if (data.section === 'body') {
          if (data.column.index === 0 || data.column.index === 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [212, 175, 55];
          }
        }
      }
    });

    doc.save("relatorio_diretoria.pdf");
  };

  const gerarPdf = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Agendamentos - Equipe Rangel Jr. | Agendadas", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.text("Período: Todas as Visitas | Corretor: Todos", 14, 28);

    const tableData = agendamentos.map(a => [
      formatarData(a.data),
      a.horario.slice(0, 5),
      a.corretor,
      a.cliente_nome,
      a.imovel,
      calcularStatus(a)
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Data", "Horário", "Corretor", "Cliente", "Imóvel", "Status"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [212, 175, 55] },
      didParseCell: function (data) {
        if (data.section === 'body') {
          if (data.column.index === 0 || data.column.index === 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [212, 175, 55];
          }
        }
      }
    });

    doc.save("relatorio_agendamentos.pdf");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* SIMULADOR DE ACESSO E SEXTA */}
      <div className="bg-dark-200 border border-dark-100 rounded-xl p-3 flex flex-wrap justify-end items-center gap-4">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="simularSexta"
            checked={simularSexta}
            onChange={(e) => setSimularSexta(e.target.checked)}
            className="accent-primary w-3.5 h-3.5 cursor-pointer"
          />
          <label htmlFor="simularSexta" className="text-xs text-primary font-bold uppercase tracking-wider cursor-pointer">Simular Sexta 17:00</label>
        </div>
        <div className="w-px h-4 bg-dark-100 hidden sm:block"></div>
        {cargoReal === 'admin' && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Simular Acesso:</span>
            <select 
              value={usuarioLogado}
              onChange={e => {
                setUsuarioLogado(e.target.value);
              }}
              className="bg-dark-300 border border-dark-100 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="Gerente">Gerente (Rangel Jr.)</option>
              {CORRETORES.map(c => (
                <option key={c} value={c}>Consultor: {c}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* BANNER DE AVISO (Sexta-feira 17h) - Apenas para Consultores */}
      {usuarioLogado !== "Gerente" && isSextaFeiraJanela() && !jaConfirmou && (
        <div className="bg-gradient-to-r from-primary-dark/80 to-primary/80 border border-primary text-navy p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h3 className="font-bold text-lg">Fechamento de Agenda - Próxima Semana</h3>
            <p className="text-sm font-medium opacity-90">Por favor, confirme todas as visitas cadastradas para a próxima semana.</p>
          </div>
          <button 
            onClick={confirmarAgenda}
            disabled={isConfirming}
            className={`bg-navy text-primary px-6 py-2.5 rounded-lg font-bold transition-all shadow-md whitespace-nowrap ${isConfirming ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dark-300 hover:shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] hover:-translate-y-0.5'}`}
          >
            {isConfirming ? 'Enviando...' : 'Confirmar Todas as Visitas Cadastradas para a Próxima Semana'}
          </button>
        </div>
      )}

      {usuarioLogado !== "Gerente" && isSextaFeiraJanela() && jaConfirmou && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl flex items-center justify-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-bold text-sm">Agenda confirmada com sucesso para a gerência!</span>
        </div>
      )}

      {/* PAINEL DE MONITORAMENTO (Gerência) */}
      {usuarioLogado === "Gerente" && (
        <div className="bg-dark-200 border border-dark-100 rounded-xl p-6 shadow-sm animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Status de Confirmação da Equipe</h2>
              <p className="text-sm text-gray-400 mt-1">Monitoramento de fechamentos para a próxima semana</p>
            </div>
            <button 
              onClick={gerarPdfDiretoria}
              className="bg-primary hover:bg-primary-dark text-navy px-4 py-2 rounded-md font-bold text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center gap-2 whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              Exportar Relatório Consolidado para Diretoria
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {listaCorretoresDb.map(c => {
              const isConfirmado = corretoresConfirmados.includes(c);
              const titleText = isConfirmado ? "Confirmado" : "Não Sinalizou";
              
              return (
                <div key={c} className="bg-dark-300 border border-dark-100 rounded-lg p-3 flex items-center gap-2.5 group">
                  <div 
                    title={titleText}
                    className={`w-3 h-3 rounded-full shadow-sm shrink-0 transition-all ${isConfirmado ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}
                    aria-label={`Status de ${c}`}
                  />
                  <span className="text-xs font-medium text-gray-300 truncate group-hover:text-white transition-colors cursor-default" title={titleText}>
                    {c.split(" ")[0]} {c.split(" ").length > 1 ? c.split(" ").pop()?.charAt(0) + "." : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">
            <span className="font-semibold text-primary">Agendamentos</span>
          </h1>
          <p className="text-gray-400 mt-1">Gerencie suas visitas do dia</p>
        </div>
        <button 
          onClick={gerarPdf}
          className="bg-dark-200 border border-dark-100 hover:border-primary text-gray-300 hover:text-primary px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Gerar Relatório PDF
        </button>
      </div>



      <div className="bg-dark-200 border border-dark-100 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm items-end animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="w-full md:w-auto flex-1 max-w-xs">
          <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Período</label>
          <select 
            value={filtroPeriodo}
            onChange={e => setFiltroPeriodo(e.target.value)}
            className="w-full bg-dark-300 border border-dark-100 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
          >
            <option value="Todas">Todos os Períodos</option>
            <option value="ProximaSemana">Próxima Semana</option>
            <option value="Mês">Este Mês</option>
            <option value="Semestre">Este Semestre</option>
            <option value="Ano">Este Ano</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        {filtroPeriodo === "Manual" && (
          <div className="flex gap-2 w-full md:w-auto animate-in fade-in duration-300">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">De</label>
              <input 
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="w-full bg-dark-300 border border-dark-100 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Até</label>
              <input 
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="w-full bg-dark-300 border border-dark-100 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
        )}

        <div className="w-full md:w-auto flex-1 max-w-xs">
          <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Corretor</label>
          <input 
            type="text"
            placeholder="Nome do corretor..."
            value={filtroCorretor}
            onChange={e => setFiltroCorretor(e.target.value)}
            className="w-full bg-dark-300 border border-dark-100 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="w-full md:w-auto flex-1 max-w-xs">
          <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Empreendimento</label>
          <input 
            type="text"
            placeholder="Nome do imóvel..."
            value={filtroEmpreendimento}
            onChange={e => setFiltroEmpreendimento(e.target.value)}
            className="w-full bg-dark-300 border border-dark-100 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agendamentos.map((agendamento) => {
          const statusAtual = calcularStatus(agendamento);
          
          return (
          <div
            key={agendamento.id}
            className="group relative bg-dark-200 rounded-xl border border-dark-100 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.1)] overflow-hidden"
          >
            <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border z-10 backdrop-blur-sm ${statusStyles[statusAtual]}`}>
              {statusAtual}
            </span>
            
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <Calendar className="w-5 h-5 text-primary mb-0.5" />
                  <span className="text-xl font-bold text-primary leading-none">{formatarData(agendamento.data)}</span>
                </div>
                <div className="w-px h-8 bg-primary/20"></div>
                <div className="flex flex-col items-center">
                  <Clock className="w-5 h-5 text-primary mb-0.5" />
                  <span className="text-xl font-bold text-white tracking-wide leading-none">{agendamento.horario.slice(0, 5)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div>
                <p className="text-[9px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold">Cliente</p>
                <p className="font-medium text-sm text-white truncate flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary shrink-0 opacity-70" />
                  {agendamento.cliente_nome}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold">Imóvel</p>
                  <p className="font-medium text-xs text-white truncate flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-primary shrink-0 opacity-70" />
                    {agendamento.imovel}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold">Corretor</p>
                  <p className="font-medium text-xs text-gray-300 truncate">{agendamento.corretor}</p>
                </div>
              </div>
              {agendamento.tipo === "Investimento" && (
                <div className="inline-block bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold mt-1">
                  Perfil Investidor
                </div>
              )}
            </div>

            {statusAtual !== "Desmarcada" && (
              <div className="mt-4 pt-3 border-t border-dark-100 flex justify-end gap-3 relative z-10 opacity-60 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => desmarcarVisita(agendamento.id)}
                  className="text-[9px] font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                  Desmarcar
                </button>
                <button 
                  onClick={() => abrirModalReagendamento(agendamento)}
                  className="text-[9px] font-semibold text-gray-400 hover:text-primary transition-colors uppercase tracking-wider"
                >
                  Reagendar
                </button>
              </div>
            )}

            <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-xl transition-colors duration-300 pointer-events-none" />
          </div>
        )})}

        {isLoading ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-dark-200/50 rounded-xl border border-dark-100 border-dashed animate-pulse">
            Carregando agendamentos...
          </div>
        ) : agendamentos.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-dark-200/50 rounded-xl border border-dark-100 border-dashed">
            Nenhum agendamento encontrado no banco de dados.
          </div>
        )}
      </div>



      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-dark-200 border border-dark-100 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Reagendar Visita</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nova Data</label>
                <input 
                  type="date" 
                  value={rescheduleData}
                  onChange={(e) => setRescheduleData(e.target.value)}
                  className="w-full bg-dark-300 border border-dark-100 rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Novo Horário</label>
                <input 
                  type="time" 
                  value={rescheduleHora}
                  onChange={(e) => setRescheduleHora(e.target.value)}
                  className="w-full bg-dark-300 border border-dark-100 rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsRescheduleModalOpen(false)}
                className="px-4 py-2 rounded-md text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarReagendamento}
                className="bg-primary hover:bg-primary-dark text-navy px-4 py-2 rounded-md font-semibold transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
