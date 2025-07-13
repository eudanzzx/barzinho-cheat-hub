
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
    
    // Deve ter clientName válido
    const hasValidClientName = Boolean(plano.clientName);
    
    // Para planos semanais, aceitar analysisId válido OU N/A (planos criados diretamente)
    let hasValidAnalysisId = true;
    let isNotOrphan = true;
    
    if (plano.type === 'semanal' && 'analysisId' in plano) {
      const semanalPlano = plano as PlanoSemanal;
      
      // Se tem analysisId válido, verificar se o ID segue o padrão correto
      if (semanalPlano.analysisId && semanalPlano.analysisId !== 'N/A') {
        // ID deve começar com analysisId para não ser órfão
        if (!semanalPlano.id.startsWith(semanalPlano.analysisId)) {
          isNotOrphan = false;
          console.log(`REMOVENDO plano órfão/duplicado: ${semanalPlano.id} (analysisId: ${semanalPlano.analysisId})`);
        }
      }
      // Se analysisId é N/A, aceitar (planos criados diretamente no controle)
    } else if (plano.type === 'plano') {
      // Para planos mensais, DEVE ter analysisId válido
      hasValidAnalysisId = 'analysisId' in plano && Boolean(plano.analysisId) && plano.analysisId !== 'N/A';
    }
    
    // Log para cada plano processado
    console.log(`filterTarotPlans - Avaliando plano ${plano.id}:`, {
      type: plano.type,
      isTarotPlan,
      active: plano.active,
      isActive,
      hasValidAnalysisId,
      hasValidClientName,
      isNotOrphan,
      analysisId: 'analysisId' in plano ? plano.analysisId : 'N/A',
      clientName: plano.clientName,
      dueDate: plano.dueDate,
      amount: plano.amount,
      month: 'month' in plano ? plano.month : 'N/A',
      week: 'week' in plano ? plano.week : 'N/A'
    });
    
    return isTarotPlan && isActive && hasValidAnalysisId && hasValidClientName && isNotOrphan;
  }).filter((plano, index, array) => {
    // Remover planos duplicados baseado no id
    return array.findIndex(p => p.id === plano.id) === index;
  });
  
  console.log('filterTarotPlans - Planos ativos de tarot:', tarotPlans.length);
  
  // Filtrar por data de vencimento - usar data exata do plano sem processamento
  const validPlans = tarotPlans.filter(plano => {
    // Usar a data diretamente como string no formato YYYY-MM-DD para evitar problemas de timezone
    const dueDateStr = plano.dueDate; // Formato: "YYYY-MM-DD"
    const todayStr = today.toISOString().split('T')[0]; // Formato: "YYYY-MM-DD"
    
    // Calcular diferença usando apenas as strings de data
    const dueDate = new Date(dueDateStr + 'T12:00:00.000Z'); // Meio-dia UTC para evitar timezone issues
    const todayDate = new Date(todayStr + 'T12:00:00.000Z');
    
    const timeDiff = dueDate.getTime() - todayDate.getTime();
    const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    
    // Mostrar planos que vencem até 90 dias ou já venceram há até 30 dias
    const shouldShow = daysDiff <= 90 && daysDiff >= -30;
    
    console.log(`DEBUG NOTIFICAÇÕES - Plano ${plano.id} data:`, {
      originalDueDate: plano.dueDate,
      dueDateStr,
      todayStr,
      daysDiff,
      shouldShow,
      timeDiff,
      clientName: plano.clientName,
      amount: plano.amount,
      type: plano.type,
      week: 'week' in plano ? plano.week : 'N/A',
      analysisId: 'analysisId' in plano ? plano.analysisId : 'N/A'
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
