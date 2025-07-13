
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
    console.log('saveTarotAnalysisWithPlan - Salvando análise com planos:', {
      id: analysis.id,
      clientName: analysis.nomeCliente || analysis.clientName,
      planoAtivo: analysis.planoAtivo,
      semanalAtivo: analysis.semanalAtivo
    });
    
    // Salvar análise primeiro
    const analyses = tarotService.getTarotAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    tarotService.saveTarotAnalyses(analyses);
    console.log('saveTarotAnalysisWithPlan - Análise salva');
    
    // Criar planos de uma só vez (não separadamente)
    if ((analysis.planoAtivo && analysis.planoData) || (analysis.semanalAtivo && analysis.semanalData)) {
      console.log('saveTarotAnalysisWithPlan - Criando planos:', {
        mensal: analysis.planoAtivo && analysis.planoData ? analysis.planoData : null,
        semanal: analysis.semanalAtivo && analysis.semanalData ? analysis.semanalData : null
      });
      tarotPlanoCreator.createTarotPlanos(analysis);
    }
    
    // Disparar eventos de sincronização IMEDIATAMENTE
    console.log('saveTarotAnalysisWithPlan - Disparando eventos de sincronização');
    const events = [
      'tarotAnalysesUpdated',
      'planosUpdated',
      'tarot-payment-updated',
      'atendimentosUpdated',
      'paymentStatusChanged'
    ];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: { 
          analysisId: analysis.id,
          timestamp: Date.now(),
          action: 'analysis_saved'
        }
      }));
    });
    
    console.log('saveTarotAnalysisWithPlan - Eventos disparados');
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
