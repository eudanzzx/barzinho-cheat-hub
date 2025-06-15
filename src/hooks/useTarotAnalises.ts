
import { useState, useEffect, useMemo, useCallback } from "react";
import useUserDataService from "@/services/userDataService";
import { useDebounce } from "./useDebounce";

const defaultStats = { total: 0, semana: 0, mes: 0, ano: 0 };

export function useTarotAnalises() {
  const { getAllTarotAnalyses, saveAllTarotAnalyses, deleteTarotAnalysis } =
    useUserDataService();

  const [analises, setAnalises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [selectedPeriod, setSelectedPeriod] = useState<"semana" | "mes" | "ano" | "total">("total");
  const [aniversarianteHoje, setAniversarianteHoje] = useState<any>(null);
  const [recebidoStats, setRecebidoStats] = useState(defaultStats);

  // Debounce search term para reduzir re-renderizações
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Carrega análises
  useEffect(() => {
    setAnalises(getAllTarotAnalyses());
  }, [getAllTarotAnalyses]);

  // Watch nas análises
  useEffect(() => {
    if (!analises.length) return;
    checkBirthdaysToday();
    calculaStatsRecebido();
  }, [analises]);

  const checkBirthdaysToday = useCallback(() => {
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
  }, [analises]);

  // Filtros e busca otimizados com useMemo
  const filteredAnalises = useMemo(() => {
    if (!debouncedSearchTerm) return analises;
    return analises.filter((a) =>
      a.nomeCliente?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, analises]);

  // Tabs otimizadas com useMemo
  const tabAnalises = useMemo(() => {
    switch (activeTab) {
      case "finalizadas":
        return filteredAnalises.filter((a) => a.finalizado);
      case "pendentes":
        return filteredAnalises.filter((a) => !a.finalizado);
      case "atencao":
        return filteredAnalises.filter((a) => a.atencaoFlag);
      default:
        return filteredAnalises;
    }
  }, [activeTab, filteredAnalises]);

  // Stats financeiros otimizados
  const calculaStatsRecebido = useCallback(() => {
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
  }, [analises]);

  const getStatusCounts = useCallback(() => {
    const finalizados = analises.filter((a) => a.finalizado).length;
    const emAndamento = analises.filter((a) => !a.finalizado).length;
    const atencao = analises.filter((a) => a.atencaoFlag).length;
    return { finalizados, emAndamento, atencao };
  }, [analises]);

  // Handlers otimizados
  const reloadAnalises = useCallback(() => {
    setAnalises(getAllTarotAnalyses());
  }, [getAllTarotAnalyses]);

  const handleDelete = useCallback((id: string) => {
    deleteTarotAnalysis(id);
    reloadAnalises();
  }, [deleteTarotAnalysis, reloadAnalises]);

  const handleToggleFinished = useCallback((id: string) => {
    const updatedAnalises = analises.map((a) =>
      a.id === id ? { ...a, finalizado: !a.finalizado } : a
    );
    saveAllTarotAnalyses(updatedAnalises);
    setAnalises(updatedAnalises);
  }, [analises, saveAllTarotAnalyses]);

  const handlePeriodChange = useCallback((period: "semana" | "mes" | "ano" | "total") => {
    setSelectedPeriod(period);
  }, []);

  return {
    analises,
    setAnalises,
    filteredAnalises,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    tabAnalises,
    selectedPeriod,
    handlePeriodChange,
    aniversarianteHoje,
    recebidoStats,
    getStatusCounts,
    calculaStatsRecebido,
    handleDelete,
    handleToggleFinished,
    reloadAnalises,
  };
}
