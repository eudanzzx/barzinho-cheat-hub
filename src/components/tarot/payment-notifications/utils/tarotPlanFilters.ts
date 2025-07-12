
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterTarotPlans = (allPlanos: (PlanoMensal | PlanoSemanal)[]) => {
  console.log('filterTarotPlans - Total de planos recebidos:', allPlanos.length);

  // Filtrar apenas planos de análises de tarot (que têm analysisId) E estão ativos
  // USAR AS DATAS DO CONTROLE DE PAGAMENTOS (sempre sincronizado)
  const tarotActivePlans = allPlanos.filter(plano => 
    plano.analysisId && plano.active
  );

  // Ordenar por data de vencimento ascendente (mais próximo primeiro)
  const sorted = tarotActivePlans.sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  console.log('filterTarotPlans - Planos ativos de tarot:', sorted.length);

  return sorted;
};
