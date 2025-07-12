import { useMemo, useRef, useCallback } from 'react';
import { useTarotAnalysisService, TarotAnalysis } from "./tarotAnalysisService";
import { useAtendimentoService, AtendimentoData } from "./atendimentoService";
import { usePlanoService } from "./planoService";
import { useTarotPlanoCreator } from "./tarotPlanoCreator";
import { checkClientBirthday } from "./utils/birthdayUtils";

// Cache global para evitar múltiplas inicializações
let serviceCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 2000; // 2 segundos de cache

const useOptimizedUserDataService = () => {
  const now = Date.now();
  
  // Usar cache se ainda válido
  if (serviceCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return serviceCache;
  }

  // Remover log para reduzir ruído no console

  const atendimentoService = useAtendimentoService();
  const tarotService = useTarotAnalysisService();
  const planoService = usePlanoService();
  const tarotPlanoCreator = useTarotPlanoCreator();

  const saveTarotAnalysisWithPlan = useCallback((analysis: TarotAnalysis) => {
    // Salvando análise com planos (log removido para performance)
    
    const analyses = tarotService.getTarotAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    tarotService.saveTarotAnalyses(analyses);
    
    // Criar planos automaticamente
    tarotPlanoCreator.createTarotPlanos(analysis);
    
    // Disparar evento para notificar mudanças
    window.dispatchEvent(new Event('tarotAnalysesUpdated'));
  }, [tarotService, tarotPlanoCreator]);

  const optimizedService = {
    // Atendimento methods - memoizados
    getAtendimentos: useCallback(atendimentoService.getAtendimentos, [atendimentoService]),
    saveAtendimentos: useCallback(atendimentoService.saveAtendimentos, [atendimentoService]),
    getClientsWithConsultations: useCallback(atendimentoService.getClientsWithConsultations, [atendimentoService]),
    
    // Tarot analysis methods - memoizados
    getTarotAnalyses: useCallback(tarotService.getTarotAnalyses, [tarotService]),
    saveTarotAnalyses: useCallback(tarotService.saveTarotAnalyses, [tarotService]),
    deleteTarotAnalysis: useCallback(tarotService.deleteTarotAnalysis, [tarotService]),
    getAllTarotAnalyses: useCallback(tarotService.getAllTarotAnalyses, [tarotService]),
    saveAllTarotAnalyses: useCallback(tarotService.saveAllTarotAnalyses, [tarotService]),
    saveTarotAnalysisWithPlan,
    
    // Plano methods - memoizados
    getPlanos: useCallback(planoService.getPlanos, [planoService]),
    savePlanos: useCallback(planoService.savePlanos, [planoService]),
    createTarotPlanos: useCallback(tarotPlanoCreator.createTarotPlanos, [tarotPlanoCreator]),
    
    // Utility methods
    checkClientBirthday: useCallback(checkClientBirthday, []),
  };

  // Atualizar cache
  serviceCache = optimizedService;
  cacheTimestamp = now;

  return optimizedService;
};

export default useOptimizedUserDataService;
export type { AtendimentoData, TarotAnalysis };