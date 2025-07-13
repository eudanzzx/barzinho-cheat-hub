
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
    
    // Para planos mensais, deve ter analysisId OU clientName
    // Para planos semanais, pode não ter analysisId se foi criado diretamente
    const hasValidIdentifier = 'analysisId' in plano ? 
      Boolean(plano.analysisId) || Boolean(plano.clientName) : 
      Boolean(plano.clientName);
    
    // Log para cada plano processado
    console.log(`filterTarotPlans - Avaliando plano ${plano.id}:`, {
      type: plano.type,
      isTarotPlan,
      active: plano.active,
      isActive,
      hasValidIdentifier,
      analysisId: 'analysisId' in plano ? plano.analysisId : 'N/A',
      clientName: plano.clientName,
      dueDate: plano.dueDate,
      amount: plano.amount,
      month: 'month' in plano ? plano.month : 'N/A',
      week: 'week' in plano ? plano.week : 'N/A'
    });
    
    return isTarotPlan && isActive && hasValidIdentifier;
  });
  
  console.log('filterTarotPlans - Planos ativos de tarot:', tarotPlans.length);
  
  // Filtrar por data de vencimento - usar data exata do plano
  const validPlans = tarotPlans.filter(plano => {
    // Usar a data exata do plano sem modificações
    const planoDueDate = new Date(plano.dueDate);
    planoDueDate.setHours(0, 0, 0, 0);
    
    // Calcular diferença em dias de forma mais precisa
    const timeDiff = planoDueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // Mostrar planos que vencem até 90 dias ou já venceram há até 30 dias
    const shouldShow = daysDiff <= 90 && daysDiff >= -30;
    
    console.log(`filterTarotPlans - Plano ${plano.id} data:`, {
      originalDueDate: plano.dueDate,
      planoDueDateProcessed: planoDueDate.toISOString().split('T')[0],
      todayProcessed: today.toISOString().split('T')[0],
      daysDiff,
      shouldShow,
      timeDiff,
      clientName: plano.clientName,
      amount: plano.amount
    });
    
    return shouldShow;
  });
  
  console.log('filterTarotPlans - Planos com vencimento válido:', validPlans.length);
  
  // Ordenar por data de vencimento (mais urgente primeiro)
  const sortedPlans = validPlans.sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  console.log('filterTarotPlans - Planos ordenados:', sortedPlans.map(p => ({
    id: p.id,
    clientName: p.clientName,
    dueDate: p.dueDate,
    type: p.type
  })));
  
  return sortedPlans;
};
