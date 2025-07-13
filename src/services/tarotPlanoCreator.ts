
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
      console.log('🚀 createTarotPlanos - Criando planos semanais para:', clientName);
      
      const totalWeeks = parseInt(analysis.semanalData.semanas);
      const weeklyAmount = parseFloat(analysis.semanalData.valorSemanal);
      const diaVencimento = analysis.semanalData.diaVencimento || 'sexta';
      
      // USAR A MESMA LÓGICA DO useAtendimentoSave que funciona corretamente
      const referenceDate = new Date(startDate);
      console.log('🔍 createTarotPlanos - Data de referência:', {
        startDate,
        referenceDate: referenceDate.toDateString(),
        diaVencimento,
        totalWeeks
      });
      
      const weekDays = getNextWeekDays(totalWeeks, diaVencimento, referenceDate);
      
      console.log('🔧 createTarotPlanos - Datas calculadas para TODOS os planos semanais:', 
        weekDays.map((date, index) => ({
          week: index + 1,
          date: date.toISOString().split('T')[0],
          dateObject: date.toDateString(),
          dayOfWeek: date.getDay(),
          dayName: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][date.getDay()]
        }))
      );
      
      // Criar TODOS os planos semanais (não apenas o primeiro)
      weekDays.forEach((weekDay, index) => {
        const week = index + 1;
        const dueDate = weekDay.toISOString().split('T')[0];
        const planoId = `${analysis.id}-week-${week}`;
        
        newPlanos.push({
          id: planoId,
          clientName: clientName,
          type: 'semanal',
          amount: weeklyAmount,
          dueDate: dueDate,
          week: week,
          totalWeeks: totalWeeks,
          created: new Date().toISOString(),
          active: true,
          analysisId: analysis.id,
          notificationTiming: 'on_due_date'
        });
        
        console.log(`🚀 createTarotPlanos - Plano semanal ${week}/${totalWeeks} criado:`, {
          id: planoId,
          dueDate: dueDate,
          dayOfWeek: weekDay.getDay(),
          dayName: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][weekDay.getDay()],
          diaVencimentoSelecionado: diaVencimento
        });
      });
      
      console.log(`✅ createTarotPlanos - Criados ${weekDays.length} planos semanais com datas corretas!`);
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
