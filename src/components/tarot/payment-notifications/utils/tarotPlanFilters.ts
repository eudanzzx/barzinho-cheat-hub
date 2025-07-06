
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterTarotPlans = (allPlanos: (PlanoMensal | PlanoSemanal)[]) => {
  console.log('filterTarotPlans - Total de planos recebidos:', allPlanos.length);

  // 1. Filtrar só planos com analysisId (de tarot) - TODOS (pagos e pendentes)
  const tarotPlans = allPlanos.filter(plano => plano.analysisId);

  // 2. Ordernar por data de vencimento ascendente (mais próximo primeiro)
  const sorted = tarotPlans.sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // (Opcional: poderia fazer filtros extras, mas pedido é mostrar TODOS)
  console.log('filterTarotPlans - Todos vencimentos:', sorted.length);

  return sorted;
};
