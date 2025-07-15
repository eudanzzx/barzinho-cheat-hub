
import { useMemo, useRef, useCallback } from 'react';
import { useTarotAnalysisService, TarotAnalysis } from "./tarotAnalysisService";
import { useAtendimentoService, AtendimentoData } from "./atendimentoService";
import { usePlanoService } from "./planoService";
import { useTarotPlanoCreator } from "./tarotPlanoCreator";
import { checkClientBirthday } from "./utils/birthdayUtils";

const useOptimizedUserDataService = () => {
  const atendimentoService = useAtendimentoService();
  const tarotService = useTarotAnalysisService();
  const planoService = usePlanoService();
  const tarotPlanoCreator = useTarotPlanoCreator();

  const saveTarotAnalysisWithPlan = useCallback((analysis: TarotAnalysis) => {
    const analyses = tarotService.getTarotAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    tarotService.saveTarotAnalyses(analyses);
    tarotPlanoCreator.createTarotPlanos(analysis);
    
    window.dispatchEvent(new Event('tarotAnalysesUpdated'));
  }, [tarotService, tarotPlanoCreator]);

  const optimizedService = useMemo(() => ({
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
  }), [atendimentoService, tarotService, planoService, tarotPlanoCreator, saveTarotAnalysisWithPlan]);

  return optimizedService;
};

export default useOptimizedUserDataService;
export type { AtendimentoData, TarotAnalysis };
