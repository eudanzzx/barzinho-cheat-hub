
import { Plano } from "@/types/payment";

export const filterTarotPlans = (allPlanos: Plano[]) => {
  console.log('filterTarotPlans - Total de planos recebidos:', allPlanos.length);
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  console.log('filterTarotPlans - Data de hoje:', todayStr);
  
  const filteredPlanos = allPlanos.filter(plano => {
    // Deve ter analysisId (ser do tarot)
    if (!plano.analysisId) {
      return false;
    }
    
    // Deve estar ativo
    if (!plano.active) {
      console.log('filterTarotPlans - Plano inativo ignorado:', plano.id);
      return false;
    }
    
    // Verificar se o plano está vencido ou vence hoje
    const dueDate = new Date(plano.dueDate);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    console.log(`filterTarotPlans - Plano ${plano.id}: vence em ${dueDateStr}, hoje é ${todayStr}`);
    
    // Incluir se vence hoje ou já venceu
    const shouldInclude = dueDateStr <= todayStr;
    
    if (shouldInclude) {
      console.log('filterTarotPlans - Plano incluído:', plano.id, 'Cliente:', plano.clientName);
    }
    
    return shouldInclude;
  });
  
  console.log('filterTarotPlans - Planos filtrados:', filteredPlanos.length);
  
  return filteredPlanos;
};
