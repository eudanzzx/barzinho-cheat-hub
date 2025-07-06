
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterMainPlans = (allPlanos: (PlanoMensal | PlanoSemanal)[], existingClientNames: Set<string>) => {
  console.log('filterMainPlans - Total de planos recebidos:', allPlanos.length);

  // 1. Para próximos vencimentos, filtrar apenas planos sem analysisId (não são do tarot), ATIVOS (pendentes) e de clientes existentes
  const mainPlans = allPlanos.filter(plano => 
    !plano.analysisId && 
    plano.active && // Próximos vencimentos só mostra pendentes
    existingClientNames.has(plano.clientName)
  );

  // 2. Ordenar por data de vencimento ascendente (mais próximo primeiro)
  const sorted = mainPlans.sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  console.log('filterMainPlans - Planos principais encontrados:', sorted.length);

  return sorted;
};
