
import { useTarotAnalysisService, TarotAnalysis } from "./tarotAnalysisService";
import { useAtendimentoService, AtendimentoData } from "./atendimentoService";
import { usePlanoService } from "./planoService";
import { useTarotPlanoCreator } from "./tarotPlanoCreator";
import { checkClientBirthday } from "./utils/birthdayUtils";

const useUserDataService = () => {
  console.log('useUserDataService - Inicializando serviço');

  const atendimentoService = useAtendimentoService();
  const tarotService = useTarotAnalysisService();
  const planoService = usePlanoService();
  const tarotPlanoCreator = useTarotPlanoCreator();

  const saveTarotAnalysisWithPlan = (analysis: TarotAnalysis) => {
    console.log('saveTarotAnalysisWithPlan - Salvando análise com planos:', analysis.id);
    
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
  };

  return {
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
  };
};

export default useUserDataService;
export type { AtendimentoData, TarotAnalysis };
