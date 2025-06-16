
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

  // Carrega análises apenas uma vez
  useEffect(() => {
    const loadAnalises = () => {
      try {
        const data = getAllTarotAnalyses();
        setAnalises(data);
      } catch (error) {
        console.error('Erro ao carregar análises:', error);
        setAnalises([]);
      }
    };
    
    loadAnalises();
  }, [getAllTarotAnalyses]);

  // Calcular stats apenas quando análises mudam - otimizado
  useEffect(() => {
    if (analises.length === 0) {
      setRecebidoStats(defaultStats);
      setAniversarianteHoje(null);
      return;
    }

    // Verificar aniversários de forma otimizada
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    
    let birthdayClient = null;
    let total = 0, semana = 0, mes = 0, ano = 0;
    const now = new Date();
    
    // Uma única iteração para todas as verificações
    for (const analise of analises) {
      // Verificar aniversário apenas se ainda não encontrou
      if (!birthdayClient && analise.dataNascimento) {
        try {
          const [year, month, day] = analise.dataNascimento.split("-").map(Number);
          if (day === todayDay && month === todayMonth) {
            birthdayClient = {
              nome: analise.nomeCliente,
              dataNascimento: analise.dataNascimento,
            };
          }
        } catch {
          // Ignorar erro de parsing
        }
      }
      
      // Calcular stats financeiros
      const preco = parseFloat(analise.preco || "150");
      total += preco;
      
      const date = new Date(analise.dataInicio || analise.dataAtendimento);
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
    }

    setAniversarianteHoje(birthdayClient);
    setRecebidoStats({ total, semana, mes, ano });
  }, [analises]);

  // Filtros otimizados com useMemo
  const filteredAnalises = useMemo(() => {
    if (!debouncedSearchTerm) return analises;
    const term = debouncedSearchTerm.toLowerCase();
    return analises.filter((a) =>
      a.nomeCliente?.toLowerCase().includes(term)
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

  const getStatusCounts = useMemo(() => {
    const finalizados = analises.filter((a) => a.finalizado).length;
    const emAndamento = analises.filter((a) => !a.finalizado).length;
    const atencao = analises.filter((a) => a.atencaoFlag).length;
    return { finalizados, emAndamento, atencao };
  }, [analises]);

  // Handlers otimizados
  const reloadAnalises = useCallback(() => {
    try {
      const data = getAllTarotAnalyses();
      setAnalises(data);
    } catch (error) {
      console.error('Erro ao recarregar análises:', error);
    }
  }, [getAllTarotAnalyses]);

  const handleDelete = useCallback((id: string) => {
    try {
      deleteTarotAnalysis(id);
      reloadAnalises();
    } catch (error) {
      console.error('Erro ao deletar análise:', error);
    }
  }, [deleteTarotAnalysis, reloadAnalises]);

  const handleToggleFinished = useCallback((id: string) => {
    try {
      const updatedAnalises = analises.map((a) =>
        a.id === id ? { ...a, finalizado: !a.finalizado } : a
      );
      saveAllTarotAnalyses(updatedAnalises);
      setAnalises(updatedAnalises);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  }, [analises, saveAllTarotAnalyses]);

  const handlePeriodChange = useCallback((period: "semana" | "mes" | "ano" | "total") => {
    setSelectedPeriod(period);
  }, []);

  return {
    analises,
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
    handleDelete,
    handleToggleFinished,
    reloadAnalises,
  };
}
