
import { TarotAnalysis } from "./tarotAnalysisService";
import { Plano } from "@/types/payment";
import { usePlanoService } from "./planoService";
import { getNextWeekDays } from "@/utils/weekDayCalculator";

export const useTarotPlanoCreator = () => {
  const { getPlanos, savePlanos } = usePlanoService();

  const createTarotPlanos = (analysis: TarotAnalysis) => {
    const currentPlanos = getPlanos();
    const filteredPlanos = currentPlanos.filter(plano => plano.analysisId !== analysis.id);
    
    const newPlanos: Plano[] = [];
    const clientName = analysis.nomeCliente || analysis.clientName;
    const startDate = analysis.dataInicio || analysis.analysisDate || new Date().toISOString().split('T')[0];
    
    // Criar plano mensal se ativo
    if (analysis.planoAtivo && analysis.planoData) {
      const totalMonths = parseInt(analysis.planoData.meses);
      const monthlyAmount = parseFloat(analysis.planoData.valorMensal);
      
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
      const totalWeeks = parseInt(analysis.semanalData.semanas);
      const weeklyAmount = parseFloat(analysis.semanalData.valorSemanal);
      const diaVencimento = analysis.semanalData.diaVencimento || 'sexta';
      
      const referenceDate = new Date(startDate);
      const weekDays = getNextWeekDays(totalWeeks, diaVencimento, referenceDate);
      
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
      });
    }
    
    const updatedPlanos = [...filteredPlanos, ...newPlanos];
    savePlanos(updatedPlanos);
    
    window.dispatchEvent(new Event('planosUpdated'));
    window.dispatchEvent(new Event('tarot-payment-updated'));
  };

  return { createTarotPlanos };
};
