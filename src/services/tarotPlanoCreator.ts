
import { TarotAnalysis } from "./tarotAnalysisService";
import { Plano } from "@/types/payment";
import { usePlanoService } from "./planoService";
import { getNextWeekDays } from "@/utils/weekDayCalculator";

export const useTarotPlanoCreator = () => {
  const { getPlanos, savePlanos } = usePlanoService();

  const createTarotPlanos = (analysis: TarotAnalysis) => {
    console.log('createTarotPlanos - Criando planos para análise:', analysis.id);
    
    const currentPlanos = getPlanos();
    
    // REMOVER TODOS OS PLANOS EXISTENTES DESTA ANÁLISE PRIMEIRO
    const filteredPlanos = currentPlanos.filter(plano => plano.analysisId !== analysis.id);
    console.log('createTarotPlanos - Removidos planos antigos da análise:', analysis.id);
    
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
    
    // Criar planos semanais se ativo
    if (analysis.semanalAtivo && analysis.semanalData) {
      console.log('createTarotPlanos - Criando APENAS primeiro plano semanal para:', clientName);
      
      const totalWeeks = parseInt(analysis.semanalData.semanas);
      const weeklyAmount = parseFloat(analysis.semanalData.valorSemanal);
      const diaVencimento = analysis.semanalData.diaVencimento || 'sexta';
      
      // USAR EXATAMENTE A MESMA LÓGICA QUE O CONTROLE DE PAGAMENTOS
      // Garantir que a data de início seja tratada corretamente
      const referenceDate = new Date(startDate);
      console.log('createTarotPlanos - Data de referência inicial:', {
        startDate,
        referenceDate: referenceDate.toDateString(),
        diaVencimento
      });
      
      const weekDays = getNextWeekDays(totalWeeks, diaVencimento, referenceDate);
      
      console.log('createTarotPlanos - Datas calculadas:', 
        weekDays.map((date, index) => ({
          week: index + 1,
          date: date.toISOString().split('T')[0],
          dateObject: date.toDateString()
        }))
      );
      
      // Criar APENAS o primeiro plano semanal usando a primeira data calculada
      if (weekDays.length > 0) {
        const firstDueDate = weekDays[0].toISOString().split('T')[0];
        const planoId = `${analysis.id}-week-1`;
        
        newPlanos.push({
          id: planoId,
          clientName: clientName,
          type: 'semanal',
          amount: weeklyAmount,
          dueDate: firstDueDate,
          week: 1,
          totalWeeks: totalWeeks,
          created: new Date().toISOString(),
          active: true,
          analysisId: analysis.id,
          notificationTiming: 'on_due_date'
        });
        
        console.log('createTarotPlanos - Primeiro plano semanal criado:', {
          id: planoId,
          dueDate: firstDueDate,
          diaVencimento,
          totalWeeks,
          calculatedFromDate: referenceDate.toDateString()
        });
      }
    }
    
    // Salvar os planos atualizados (sem os antigos + os novos)
    const updatedPlanos = [...filteredPlanos, ...newPlanos];
    console.log('createTarotPlanos - Salvando', newPlanos.length, 'novos planos, total:', updatedPlanos.length);
    savePlanos(updatedPlanos);
    
    // Disparar eventos de sincronização
    window.dispatchEvent(new Event('planosUpdated'));
    window.dispatchEvent(new Event('tarot-payment-updated'));
  };

  return { createTarotPlanos };
};
