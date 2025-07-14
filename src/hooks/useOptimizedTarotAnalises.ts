import { useState, useEffect, useMemo, useCallback } from 'react';
import useUserDataService from "@/services/userDataService";
import { TarotAnalysis } from "@/services/tarotAnalysisService";
import { toast } from "sonner";
import { useOptimizedDebounce } from "./useOptimizedDebounce";

export const useOptimizedTarotAnalises = () => {
  const { getAllTarotAnalyses, deleteTarotAnalysis, saveTarotAnalysisWithPlan, checkClientBirthday, getPlanos, savePlanos } = useUserDataService();
  
  const [analises, setAnalises] = useState<TarotAnalysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todas' | 'finalizadas' | 'em-andamento'>('todas');
  const [selectedPeriod, setSelectedPeriod] = useState<'semana' | 'mes' | 'ano' | 'total'>('mes');
  const [aniversarianteHoje, setAniversarianteHoje] = useState<{ nome: string; dataNascimento: string } | null>(null);

  // Debounced search para otimizar performance
  const debouncedSearchTerm = useOptimizedDebounce(searchTerm, 200);

  const loadAnalises = useCallback(() => {
    const allAnalises = getAllTarotAnalyses();
    setAnalises(allAnalises);

    // Verificar aniversariante do dia
    if (allAnalises.length > 0) {
      const aniversariante = allAnalises.find(analise => {
        if (!analise.dataNascimento) return false;
        const birthDate = new Date(analise.dataNascimento).toISOString().slice(0, 10);
        return checkClientBirthday(birthDate);
      });

      if (aniversariante) {
        setAniversarianteHoje({
          nome: aniversariante.nomeCliente || aniversariante.clientName,
          dataNascimento: aniversariante.dataNascimento
        });
      } else {
        setAniversarianteHoje(null);
      }
    }
  }, [getAllTarotAnalyses, checkClientBirthday]);

  useEffect(() => {
    loadAnalises();
  }, [loadAnalises]);

  useEffect(() => {
    const handleDataUpdated = () => loadAnalises();
    window.addEventListener('tarotAnalysesUpdated', handleDataUpdated);
    return () => window.removeEventListener('tarotAnalysesUpdated', handleDataUpdated);
  }, [loadAnalises]);

  // Memoização otimizada das análises filtradas
  const tabAnalises = useMemo(() => {
    let filtered = analises;
    
    // Filtrar por tab
    if (activeTab === 'finalizadas') filtered = filtered.filter(analise => analise.finalizado);
    else if (activeTab === 'em-andamento') filtered = filtered.filter(analise => !analise.finalizado);
    
    // Filtrar por search term se houver
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(analise => 
        (analise.nomeCliente || analise.clientName || '').toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [analises, activeTab, debouncedSearchTerm]);

  // Estatísticas com cálculo otimizado
  const recebidoStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const filteredAnalises = tabAnalises.filter(analise => {
      if (selectedPeriod === 'total') return true;
      
      const analiseDate = new Date(analise.dataAtendimento);
      if (selectedPeriod === 'semana') return analiseDate >= startOfWeek;
      if (selectedPeriod === 'mes') return analiseDate >= startOfMonth;
      if (selectedPeriod === 'ano') return analiseDate >= startOfYear;
      
      return true;
    });

    return {
      total: filteredAnalises.reduce((sum, analise) => sum + (Number(analise.valor) || 0), 0),
      semana: analises.filter(a => new Date(a.dataAtendimento) >= startOfWeek).reduce((sum, a) => sum + (Number(a.valor) || 0), 0),
      mes: analises.filter(a => new Date(a.dataAtendimento) >= startOfMonth).reduce((sum, a) => sum + (Number(a.valor) || 0), 0),
      ano: analises.filter(a => new Date(a.dataAtendimento) >= startOfYear).reduce((sum, a) => sum + (Number(a.valor) || 0), 0),
    };
  }, [tabAnalises, selectedPeriod, analises]);

  const getStatusCounts = useMemo(() => ({
    finalizados: analises.filter(a => a.finalizado).length,
    emAndamento: analises.filter(a => !a.finalizado).length,
    atencao: 0,
  }), [analises]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const analiseToDelete = analises.find(a => a.id === id);
      
      if (analiseToDelete) {
        const allPlanos = getPlanos();
        const updatedPlanos = allPlanos.filter(plano => {
          if ('analysisId' in plano && plano.analysisId === id) return false;
          if (plano.type === 'semanal' && plano.id.startsWith(`${id}-week-`)) return false;
          if (plano.type === 'plano' && plano.id.startsWith(`${id}-month-`)) return false;
          return true;
        });
        
        if (updatedPlanos.length !== allPlanos.length) {
          savePlanos(updatedPlanos);
        }
      }
      
      deleteTarotAnalysis(id);
      setAnalises(prev => prev.filter(analise => analise.id !== id));
      
      window.dispatchEvent(new CustomEvent('tarotAnalysesUpdated'));
      window.dispatchEvent(new CustomEvent('planosUpdated'));
      window.dispatchEvent(new CustomEvent('tarot-payment-updated'));
      
      toast.success('Análise excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir análise:', error);
      toast.error('Erro ao excluir análise');
    }
  }, [analises, getPlanos, savePlanos, deleteTarotAnalysis]);

  const handleToggleFinished = useCallback((id: string) => {
    const analise = analises.find(a => a.id === id);
    if (!analise) return;
    
    const updatedAnalise = { ...analise, finalizado: !analise.finalizado };
    saveTarotAnalysisWithPlan(updatedAnalise);
    
    const updatedAnalises = analises.map(a => 
      a.id === id ? updatedAnalise : a
    );
    setAnalises(updatedAnalises);
    
    toast.success(`Análise ${updatedAnalise.finalizado ? 'finalizada' : 'reaberta'} com sucesso`);
    window.dispatchEvent(new CustomEvent('tarotAnalysesUpdated'));
  }, [analises, saveTarotAnalysisWithPlan]);

  const handlePeriodChange = useCallback((period: 'semana' | 'mes' | 'ano' | 'total') => {
    setSelectedPeriod(period);
  }, []);

  return {
    analises,
    tabAnalises,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    selectedPeriod,
    handlePeriodChange,
    aniversarianteHoje,
    recebidoStats,
    getStatusCounts,
    handleDelete,
    handleToggleFinished,
  };
};