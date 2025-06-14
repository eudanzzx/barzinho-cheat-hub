
import { Plano } from "@/types/payment";

interface AtendimentoData {
  id: string;
  nome: string;
  dataNascimento?: string;
  signo?: string;
  tipoServico: string;
  statusPagamento: 'pago' | 'pendente' | 'parcelado';
  dataAtendimento: string;
  valor: string;
  destino?: string;
  ano?: string;
  atencaoNota?: string;
  detalhes?: string;
  tratamento?: string;
  indicacao?: string;
  atencaoFlag?: boolean;
  data?: string;
  dataUltimaEdicao?: string;
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
}

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

const useUserDataService = () => {
  console.log('useUserDataService - Inicializando serviço');

  const getAtendimentos = (): AtendimentoData[] => {
    try {
      const data = localStorage.getItem("atendimentos");
      const atendimentos = data ? JSON.parse(data) : [];
      console.log('getAtendimentos - Retornando:', atendimentos.length, 'atendimentos');
      return atendimentos;
    } catch (error) {
      console.error('getAtendimentos - Erro ao buscar atendimentos:', error);
      return [];
    }
  };

  const saveAtendimentos = (atendimentos: AtendimentoData[]) => {
    try {
      localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
      console.log('saveAtendimentos - Salvos:', atendimentos.length, 'atendimentos');
    } catch (error) {
      console.error('saveAtendimentos - Erro ao salvar atendimentos:', error);
    }
  };

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

  const getPlanos = (): Plano[] => {
    try {
      const data = localStorage.getItem("planos");
      const planos = data ? JSON.parse(data) : [];
      console.log('getPlanos - Retornando:', planos.length, 'planos');
      return planos;
    } catch (error) {
      console.error('getPlanos - Erro ao buscar planos:', error);
      return [];
    }
  };

  const savePlanos = (planos: Plano[]) => {
    try {
      localStorage.setItem("planos", JSON.stringify(planos));
      console.log('savePlanos - Salvos:', planos.length, 'planos');
      
      // Disparar evento para notificar mudanças
      window.dispatchEvent(new Event('planosUpdated'));
    } catch (error) {
      console.error('savePlanos - Erro ao salvar planos:', error);
    }
  };

  const createTarotPlanos = (analysis: TarotAnalysis) => {
    console.log('createTarotPlanos - Criando planos para análise:', analysis.id);
    
    const currentPlanos = getPlanos();
    const newPlanos: Plano[] = [];
    const clientName = analysis.nomeCliente || analysis.clientName;
    const startDate = analysis.dataInicio || analysis.analysisDate || new Date().toISOString().split('T')[0];
    
    // Criar plano mensal se ativo
    if (analysis.planoAtivo && analysis.planoData) {
      console.log('createTarotPlanos - Criando plano mensal para:', clientName);
      
      const totalMonths = parseInt(analysis.planoData.meses);
      const monthlyAmount = parseFloat(analysis.planoData.valorMensal);
      
      // Usar diaVencimento do planoData se disponível, senão usar dia 5 como padrão
      let diaVencimento = 5;
      if (analysis.planoData.diaVencimento) {
        const parsedDay = parseInt(analysis.planoData.diaVencimento);
        if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
          diaVencimento = parsedDay;
        }
      }
      
      for (let month = 1; month <= totalMonths; month++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + month - 1);
        dueDate.setDate(diaVencimento);
        
        const planoId = `${analysis.id}-month-${month}`;
        
        // Verificar se plano já existe
        const existingPlano = currentPlanos.find(p => p.id === planoId);
        if (!existingPlano) {
          newPlanos.push({
            id: planoId,
            clientName: clientName,
            type: 'plano',
            amount: monthlyAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            month: month,
            totalMonths: totalMonths,
            created: new Date().toISOString(),
            active: true,
            analysisId: analysis.id,
            notificationTiming: 'on_due_date'
          });
        }
      }
    }
    
    // Criar planos semanais se ativo
    if (analysis.semanalAtivo && analysis.semanalData) {
      console.log('createTarotPlanos - Criando planos semanais para:', clientName);
      
      const totalWeeks = parseInt(analysis.semanalData.semanas);
      const weeklyAmount = parseFloat(analysis.semanalData.valorSemanal);
      
      for (let week = 1; week <= totalWeeks; week++) {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + (week - 1) * 7);
        
        // Ajustar para o dia da semana correto baseado no diaVencimento
        const diaVencimento = analysis.semanalData.diaVencimento || 'sexta';
        const dayOfWeekMap: { [key: string]: number } = {
          'domingo': 0,
          'segunda': 1,
          'terca': 2,
          'quarta': 3,
          'quinta': 4,
          'sexta': 5,
          'sabado': 6
        };
        
        const targetDay = dayOfWeekMap[diaVencimento] || 5; // sexta como padrão
        const currentDay = dueDate.getDay();
        const daysToAdd = (targetDay - currentDay + 7) % 7;
        dueDate.setDate(dueDate.getDate() + daysToAdd);
        
        const planoId = `${analysis.id}-week-${week}`;
        
        // Verificar se plano já existe
        const existingPlano = currentPlanos.find(p => p.id === planoId);
        if (!existingPlano) {
          newPlanos.push({
            id: planoId,
            clientName: clientName,
            type: 'semanal',
            amount: weeklyAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            week: week,
            totalWeeks: totalWeeks,
            created: new Date().toISOString(),
            active: true,
            analysisId: analysis.id,
            notificationTiming: 'on_due_date'
          });
        }
      }
    }
    
    if (newPlanos.length > 0) {
      console.log('createTarotPlanos - Salvando', newPlanos.length, 'novos planos');
      const updatedPlanos = [...currentPlanos, ...newPlanos];
      savePlanos(updatedPlanos);
    } else {
      console.log('createTarotPlanos - Nenhum plano novo para criar');
    }
  };

  const saveTarotAnalysisWithPlan = (analysis: TarotAnalysis) => {
    console.log('saveTarotAnalysisWithPlan - Salvando análise com planos:', analysis.id);
    
    const analyses = getTarotAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    saveTarotAnalyses(analyses);
    
    // Criar planos automaticamente
    createTarotPlanos(analysis);
    
    // Disparar evento para notificar mudanças
    window.dispatchEvent(new Event('tarotAnalysesUpdated'));
  };

  const getAllTarotAnalyses = () => getTarotAnalyses();
  const saveAllTarotAnalyses = (analyses: TarotAnalysis[]) => saveTarotAnalyses(analyses);
  const deleteTarotAnalysis = (id: string) => {
    const analyses = getTarotAnalyses();
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
    saveTarotAnalyses(updatedAnalyses);
  };

  const getClientsWithConsultations = () => {
    const atendimentos = getAtendimentos();
    return atendimentos.map(a => ({
      id: a.id,
      nome: a.nome,
      consultations: [a]
    }));
  };

  const checkClientBirthday = (birthDate: string) => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
  };

  return {
    getAtendimentos,
    saveAtendimentos,
    getTarotAnalyses,
    saveTarotAnalyses,
    getPlanos,
    savePlanos,
    createTarotPlanos,
    // Legacy methods
    getAllTarotAnalyses,
    saveAllTarotAnalyses,
    deleteTarotAnalysis,
    getClientsWithConsultations,
    checkClientBirthday,
    saveTarotAnalysisWithPlan,
  };
};

export default useUserDataService;
