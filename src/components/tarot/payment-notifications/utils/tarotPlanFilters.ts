
import { Plano, PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterTarotPlans = (allPlanos: Plano[]): (PlanoMensal | PlanoSemanal)[] => {
  console.log('filterTarotPlans - Total de planos recebidos:', allPlanos.length);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filtrar apenas planos de tarot ativos
  const tarotPlans = allPlanos.filter((plano): plano is PlanoMensal | PlanoSemanal => {
    // Deve ser plano mensal ou semanal
    const isTarotPlan = plano.type === 'plano' || plano.type === 'semanal';
    
    // Deve estar ativo - converter para boolean de forma segura
    const isActive = Boolean(plano.active === true || plano.active === 'true');
    
    // Deve ter analysisId (indicando que é de análise de tarot)
    const hasAnalysisId = 'analysisId' in plano && plano.analysisId;
    
    return isTarotPlan && isActive && hasAnalysisId;
  });
  
  console.log('filterTarotPlans - Planos ativos de tarot:', tarotPlans.length);
  
  // Filtrar por data de vencimento (próximas 2 semanas)
  const twoWeeksFromNow = new Date(today);
  twoWeeksFromNow.setDate(today.getDate() + 14);
  
  const urgentPlans = tarotPlans.filter(plano => {
    const dueDate = new Date(plano.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    // Mostrar planos que vencem até 2 semanas ou já venceram
    return dueDate <= twoWeeksFromNow;
  });
  
  // Ordenar por data de vencimento (mais urgente primeiro)
  return urgentPlans.sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  });
};
