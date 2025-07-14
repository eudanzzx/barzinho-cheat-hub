import { useCallback, useMemo } from 'react';
import { useTarotAnalysisService, TarotAnalysis } from "./tarotAnalysisService";
import { useAtendimentoService, AtendimentoData } from "./atendimentoService";
import { usePlanoService } from "./planoService";
import { useTarotPlanoCreator } from "./tarotPlanoCreator";
import { checkClientBirthday } from "./utils/birthdayUtils";

// Cache global para evitar re-inicializações desnecessárias
const serviceCache = new Map();
const CACHE_TTL = 5000; // 5 segundos

const useUnifiedDataService = () => {
  const cacheKey = 'unified-service';
  const cached = serviceCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.service;
  }

  const atendimentoService = useAtendimentoService();
  const tarotService = useTarotAnalysisService();
  const planoService = usePlanoService();
  const tarotPlanoCreator = useTarotPlanoCreator();

  // Memoizar operações custosas
  const saveTarotAnalysisWithPlan = useCallback((analysis: TarotAnalysis) => {
    const analyses = tarotService.getTarotAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    tarotService.saveTarotAnalyses(analyses);
    
    // Criar planos se necessário
    if ((analysis.planoAtivo && analysis.planoData) || (analysis.semanalAtivo && analysis.semanalData)) {
      tarotPlanoCreator.createTarotPlanos(analysis);
    }
    
    // Single event dispatch
    window.dispatchEvent(new CustomEvent('dataUpdated', {
      detail: { type: 'tarot', action: 'save', id: analysis.id }
    }));
  }, [tarotService, tarotPlanoCreator]);

  const batchUpdate = useCallback((updates: Array<{ type: string; data: any }>) => {
    updates.forEach(update => {
      switch (update.type) {
        case 'atendimento':
          atendimentoService.saveAtendimentos(update.data);
          break;
        case 'tarot':
          tarotService.saveTarotAnalyses(update.data);
          break;
        case 'plano':
          planoService.savePlanos(update.data);
          break;
      }
    });
    
    window.dispatchEvent(new CustomEvent('dataUpdated', {
      detail: { type: 'batch', updates }
    }));
  }, [atendimentoService, tarotService, planoService]);

  const service = useMemo(() => ({
    // Atendimento methods
    getAtendimentos: atendimentoService.getAtendimentos,
    saveAtendimentos: atendimentoService.saveAtendimentos,
    getClientsWithConsultations: atendimentoService.getClientsWithConsultations,
    
    // Tarot analysis methods
    getTarotAnalyses: tarotService.getTarotAnalyses,
    saveTarotAnalyses: tarotService.saveTarotAnalyses,
    deleteTarotAnalysis: tarotService.deleteTarotAnalysis,
    getAllTarotAnalyses: tarotService.getAllTarotAnalyses,
    saveAllTarotAnalyses: tarotService.saveAllTarotAnalyses,
    saveTarotAnalysisWithPlan,
    
    // Plano methods
    getPlanos: planoService.getPlanos,
    savePlanos: planoService.savePlanos,
    createTarotPlanos: tarotPlanoCreator.createTarotPlanos,
    
    // Utility methods
    checkClientBirthday,
    batchUpdate,
  }), [atendimentoService, tarotService, planoService, tarotPlanoCreator, saveTarotAnalysisWithPlan, batchUpdate]);

  // Update cache
  serviceCache.set(cacheKey, {
    service,
    timestamp: Date.now()
  });

  return service;
};

export default useUnifiedDataService;
export type { AtendimentoData, TarotAnalysis };