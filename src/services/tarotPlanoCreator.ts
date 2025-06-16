
import { TarotAnalysis } from "./tarotAnalysisService";
import { Plano } from "@/types/payment";
import { usePlanoService } from "./planoService";

export const useTarotPlanoCreator = () => {
  const { getPlanos, savePlanos } = usePlanoService();

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

  return { createTarotPlanos };
};
