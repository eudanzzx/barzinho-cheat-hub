
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterTarotPlans = (allPlanos: (PlanoMensal | PlanoSemanal)[]) => {
  console.log('filterTarotPlans - Total de planos recebidos:', allPlanos.length);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  console.log('filterTarotPlans - Data de hoje:', todayStr);

  // Filtrar apenas planos ativos e que possuem analysisId (planos de tarot)
  const tarotPlans = allPlanos.filter(plano => {
    // Deve ter analysisId para ser um plano de tarot
    if (!plano.analysisId) {
      return false;
    }
    
    // Deve estar ativo
    if (!plano.active) {
      console.log('filterTarotPlans - Plano inativo ignorado:', plano.id);
      return false;
    }

    const dueDate = new Date(plano.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    // Mostrar planos que vencem nos próximos 7 dias OU que já venceram
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`filterTarotPlans - Plano ${plano.id}: vence em ${plano.dueDate}, hoje é ${todayStr}, diferença: ${diffDays} dias`);
    
    // Incluir se vence em até 7 dias ou já venceu
    const shouldInclude = diffDays <= 7;
    
    if (shouldInclude) {
      console.log(`filterTarotPlans - Plano ${plano.id} incluído nas notificações`);
    }
    
    return shouldInclude;
  });

  console.log('filterTarotPlans - Planos de tarot filtrados:', tarotPlans.length);
  return tarotPlans;
};
