
import { useState, useEffect, useMemo } from "react";
import useUserDataService from "@/services/userDataService";

const defaultStats = { total: 0, semana: 0, mes: 0, ano: 0 };

export function useTarotAnalises() {
  const { getAllTarotAnalyses, saveAllTarotAnalyses, deleteTarotAnalysis } =
    useUserDataService();

  const [analises, setAnalises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [aniversarianteHoje, setAniversarianteHoje] = useState<any>(null);
  const [recebidoStats, setRecebidoStats] = useState(defaultStats);

  // Carrega análises
  useEffect(() => {
    setAnalises(getAllTarotAnalyses());
  }, [getAllTarotAnalyses]);

  // Watch nas análises
  useEffect(() => {
    if (!analises) return;
    checkBirthdaysToday();
    calculaStatsRecebido();
  }, [analises]);

  function checkBirthdaysToday() {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    const birthdayClient = analises.find((a) => {
      if (!a.dataNascimento) return false;
      try {
        const [year, month, day] = a.dataNascimento.split("-").map(Number);
        return day === todayDay && month === todayMonth;
      } catch {
        return false;
      }
    });
    if (birthdayClient) {
      setAniversarianteHoje({
        nome: birthdayClient.nomeCliente,
        dataNascimento: birthdayClient.dataNascimento,
      });
    }
  }

  // Filtros e busca
  const filteredAnalises = useMemo(() => {
    if (!searchTerm) return analises;
    return analises.filter((a) =>
      a.nomeCliente?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, analises]);

  // Tabs
  const tabAnalises = useMemo(() => {
    let filtered;
    switch (activeTab) {
      case "finalizadas":
        filtered = filteredAnalises.filter((a) => a.finalizado);
        break;
      case "pendentes":
        filtered = filteredAnalises.filter((a) => !a.finalizado);
        break;
      case "atencao":
        filtered = filteredAnalises.filter((a) => a.atencaoFlag);
        break;
      default:
        filtered = filteredAnalises;
    }
    return filtered;
  }, [activeTab, filteredAnalises]);

  // Stats financeiros
  function calculaStatsRecebido() {
    const now = new Date();
    let total = 0,
      semana = 0,
      mes = 0,
      ano = 0;
    analises.forEach((a) => {
      const date = new Date(a.dataInicio || a.dataAtendimento);
      const preco = parseFloat(a.preco || "150");
      total += preco;
      if (!isNaN(date.getTime())) {
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
        if (diffDays <= 7) semana += preco;
        if (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        )
          mes += preco;
        if (date.getFullYear() === now.getFullYear()) ano += preco;
      }
    });
    setRecebidoStats({ total, semana, mes, ano });
  }

  function getStatusCounts() {
    const finalizados = analises.filter((a) => a.finalizado).length;
    const emAndamento = analises.filter((a) => !a.finalizado).length;
    const atencao = analises.filter((a) => a.atencaoFlag).length;
    return { finalizados, emAndamento, atencao };
  }

  // Handlers para page
  function reloadAnalises() {
    setAnalises(getAllTarotAnalyses());
  }

  function handleDelete(id: string) {
    deleteTarotAnalysis(id);
    reloadAnalises();
  }

  function handleToggleFinished(id: string) {
    const updatedAnalises = analises.map((a) =>
      a.id === id ? { ...a, finalizado: !a.finalizado } : a
    );
    saveAllTarotAnalises(updatedAnalises);
    setAnalises(updatedAnalises);
  }

  return {
    analises,
    setAnalises,
    filteredAnalises,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    tabAnalises,
    aniversarianteHoje,
    recebidoStats,
    getStatusCounts,
    calculaStatsRecebido,
    handleDelete,
    handleToggleFinished,
    reloadAnalises,
  };
}
