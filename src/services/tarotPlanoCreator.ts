
import { TarotAnalysis } from "./tarotAnalysisService";
import { Plano } from "@/types/payment";
import { usePlanoService } from "./planoService";
import { getNextWeekDays } from "@/utils/weekDayCalculator";

export const useTarotPlanoCreator = () => {
  const { getPlanos, savePlanos } = usePlanoService();

  const createTarotPlanos = (analysis: TarotAnalysis) => {
    console.log('🚀 createTarotPlanos - INICIADO para análise:', analysis.id);
    console.log('🚀 createTarotPlanos - Dados da análise:', {
      id: analysis.id,
      clientName: analysis.nomeCliente || analysis.clientName,
      dataInicio: analysis.dataInicio,
      analysisDate: analysis.analysisDate,
      semanalAtivo: analysis.semanalAtivo,
      semanalData: analysis.semanalData
    });
    
    const currentPlanos = getPlanos();
    
    // REMOVER TODOS OS PLANOS EXISTENTES DESTA ANÁLISE PRIMEIRO
    const filteredPlanos = currentPlanos.filter(plano => plano.analysisId !== analysis.id);
    console.log('createTarotPlanos - Removidos planos antigos da análise:', analysis.id);
    
    const newPlanos: Plano[] = [];
    const clientName = analysis.nomeCliente || analysis.clientName;
    const startDate = analysis.dataInicio || analysis.analysisDate || new Date().toISOString().split('T')[0];
    
    console.log('🚀 createTarotPlanos - Dados extraídos:', {
      clientName,
      startDate,
      originalDataInicio: analysis.dataInicio,
      originalAnalysisDate: analysis.analysisDate,
      startDateType: typeof startDate
    });
    
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
      // IMPORTANTE: Verificar se a data está sendo tratada corretamente
      console.log('🔍 INVESTIGAÇÃO - Antes da conversão:', {
        startDate,
        startDateType: typeof startDate,
        isString: typeof startDate === 'string'
      });
      
      const referenceDate = new Date(startDate);
      console.log('🔍 INVESTIGAÇÃO - Após conversão:', {
        referenceDate,
        referenceDateString: referenceDate.toDateString(),
        referenceDateISO: referenceDate.toISOString(),
        isValidDate: !isNaN(referenceDate.getTime()),
        diaVencimento
      });
      
      const weekDays = getNextWeekDays(totalWeeks, diaVencimento, referenceDate);
      
      console.log('🔧 CORREÇÃO APLICADA - createTarotPlanos - Datas calculadas:', 
        weekDays.map((date, index) => ({
          week: index + 1,
          date: date.toISOString().split('T')[0],
          dateObject: date.toDateString(),
          dayOfWeek: date.getDay()
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
