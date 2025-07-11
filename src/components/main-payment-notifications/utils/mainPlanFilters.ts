
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterMainPlans = (allPlanos: (PlanoMensal | PlanoSemanal)[], existingClientNames: Set<string>) => {
  console.log('filterMainPlans - Total de planos recebidos:', allPlanos.length);

  // Mostrar TODOS os planos ativos (do controle de pagamentos), independente se são de tarot ou não
  const allActivePlans = allPlanos.filter(plano => 
    plano.active && // Só pendentes
    existingClientNames.has(plano.clientName) // De clientes existentes
  );

  // Ordenar por data de vencimento ascendente (mais próximo primeiro)
  const sorted = allActivePlans.sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  console.log('filterMainPlans - Todos os planos ativos encontrados:', sorted.length);

  return sorted;
};
