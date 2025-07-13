
import { Plano, PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterTarotPlans = (allPlanos: Plano[]): (PlanoMensal | PlanoSemanal)[] => {
  console.log('filterTarotPlans - Total de planos recebidos:', allPlanos.length);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filtrar apenas planos de tarot ativos
  const tarotPlans = allPlanos.filter((plano): plano is PlanoMensal | PlanoSemanal => {
    // Deve ser plano mensal ou semanal
    const isTarotPlan = plano.type === 'plano' || plano.type === 'semanal';
    
    // Deve estar ativo - normalizar para boolean
    const isActive = Boolean(plano.active === true || plano.active === 'true' || plano.active === '1');
    
    // Deve ter analysisId (indicando que é de análise de tarot)
    const hasAnalysisId = 'analysisId' in plano && Boolean(plano.analysisId);
    
    console.log(`filterTarotPlans - Plano ${plano.id}:`, {
      isTarotPlan,
      isActive,
      hasAnalysisId,
      active: plano.active,
      type: plano.type
    });
    
    return isTarotPlan && isActive && hasAnalysisId;
  });
  
  console.log('filterTarotPlans - Planos ativos de tarot:', tarotPlans.length);
  
  // Filtrar por data de vencimento - mostrar todos os vencimentos até 30 dias
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const urgentPlans = tarotPlans.filter(plano => {
    const dueDate = new Date(plano.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    // Mostrar planos que vencem até 30 dias ou já venceram
    const shouldShow = dueDate <= thirtyDaysFromNow;
    
    console.log(`filterTarotPlans - Plano ${plano.id} vencimento:`, {
      dueDate: plano.dueDate,
      shouldShow,
      daysUntilDue: Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    });
    
    return shouldShow;
  });
  
  console.log('filterTarotPlans - Planos com vencimento próximo:', urgentPlans.length);
  
  // Ordenar por data de vencimento (mais urgente primeiro)
  return urgentPlans.sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  });
};
