
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterTarotPlans = (allPlanos: (PlanoMensal | PlanoSemanal)[]) => {
  console.log('filterTarotPlans - Total de planos recebidos:', allPlanos.length);

  // Mostrar TODOS os planos ativos (sincronizado com o controle de pagamentos), não apenas os de tarot
  const allActivePlans = allPlanos.filter(plano => plano.active);

  // Ordenar por data de vencimento ascendente (mais próximo primeiro)
  const sorted = allActivePlans.sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  console.log('filterTarotPlans - Todos os planos ativos sincronizados:', sorted.length);

  return sorted;
};
