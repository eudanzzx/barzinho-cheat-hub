
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterMainPlans = (allPlanos: (PlanoMensal | PlanoSemanal)[], existingClientNames: Set<string>) => {
  console.log('filterMainPlans - Total de planos recebidos:', allPlanos.length);

  // 1. Filtrar apenas planos sem analysisId (não são do tarot) e de clientes existentes - TODOS (pagos e pendentes)
  const mainPlans = allPlanos.filter(plano => 
    !plano.analysisId && 
    existingClientNames.has(plano.clientName)
  );

  // 2. Ordenar por data de vencimento ascendente (mais próximo primeiro)
  const sorted = mainPlans.sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  console.log('filterMainPlans - Planos principais encontrados:', sorted.length);

  return sorted;
};
