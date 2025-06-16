
interface TarotAnalysis {
  id: string;
  clientName: string;
  clientBirthdate?: string;
  clientSign?: string;
  analysisDate: string;
  analysisType: string;
  paymentStatus: 'pago' | 'pendente' | 'parcelado';
  value: string;
  destination?: string;
  year?: string;
  attentionNote?: string;
  details?: string;
  treatment?: string;
  indication?: string;
  attentionFlag?: boolean;
  planoAtivo?: boolean;
  planoData?: {
    meses: string;
    valorMensal: string;
    diaVencimento?: string;
  } | null;
  semanalAtivo?: boolean;
  semanalData?: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  } | null;
  counter1Hours?: number;
  counter2Hours?: number;
  counter3Hours?: number;
  counter1StartDate?: string;
  counter2StartDate?: string;
  counter3StartDate?: string;
  counter1Active?: boolean;
  counter2Active?: boolean;
  counter3Active?: boolean;
  data?: string;
  dataUltimaEdicao?: string;
  // Legacy fields for backward compatibility
  nomeCliente?: string;
  dataNascimento?: string;
  signo?: string;
  atencao?: boolean;
  dataInicio?: string;
  preco?: string;
  analiseAntes?: string;
  analiseDepois?: string;
  lembretes?: any;
  finalizado?: boolean;
  tipoServico?: string;
  valor?: string;
  pergunta?: string;
  resposta?: string;
  dataAnalise?: string;
  dataCriacao?: string;
  status?: string;
  dataAtendimento?: string;
}

export const useTarotAnalysisService = () => {
  const getTarotAnalyses = (): TarotAnalysis[] => {
    try {
      const data = localStorage.getItem("analises");
      const analyses = data ? JSON.parse(data) : [];
      console.log('getTarotAnalyses - Retornando:', analyses.length, 'análises');
      return analyses;
    } catch (error) {
      console.error('getTarotAnalyses - Erro ao buscar análises:', error);
      return [];
    }
  };

  const saveTarotAnalyses = (analyses: TarotAnalysis[]) => {
    try {
      localStorage.setItem("analises", JSON.stringify(analyses));
      console.log('saveTarotAnalyses - Salvos:', analyses.length, 'análises');
    } catch (error) {
      console.error('saveTarotAnalyses - Erro ao salvar análises:', error);
    }
  };

  const deleteTarotAnalysis = (id: string) => {
    const analyses = getTarotAnalyses();
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
    saveTarotAnalyses(updatedAnalyses);
  };

  return {
    getTarotAnalyses,
    saveTarotAnalyses,
    deleteTarotAnalysis,
    // Legacy methods
    getAllTarotAnalyses: getTarotAnalyses,
    saveAllTarotAnalyses: saveTarotAnalyses,
  };
};

export type { TarotAnalysis };
