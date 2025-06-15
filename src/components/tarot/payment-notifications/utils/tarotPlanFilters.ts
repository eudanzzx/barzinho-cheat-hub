
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterTarotPlans = (allPlanos: (PlanoMensal | PlanoSemanal)[]) => {
  console.log('filterTarotPlans - Total de planos recebidos:', allPlanos.length);
  
  // 1. Filtrar só planos com analysisId (de tarot) e ativos
  const tarotPlans = allPlanos.filter(plano => plano.analysisId && plano.active);

  // 2. Map: analysisId => lista de planos ativos
  const planosByAnalysis: Record<string, (PlanoMensal | PlanoSemanal)[]> = {};
  tarotPlans.forEach(plano => {
    if (!plano.analysisId) return;
    if (!planosByAnalysis[plano.analysisId]) {
      planosByAnalysis[plano.analysisId] = [];
    }
    planosByAnalysis[plano.analysisId].push(plano);
  });

  // 3. Para cada analysisId, pegar o plano ativo com menor dueDate (mais próximo a vencer)
  const proximos: (PlanoMensal | PlanoSemanal)[] = [];
  Object.values(planosByAnalysis).forEach(lista => {
    if (!lista.length) return;
    // Escolhe o plano de menor dueDate (mais próximo a vencer)
    const maisProximo = lista.reduce((a, b) =>
      new Date(a.dueDate) < new Date(b.dueDate) ? a : b
    );
    proximos.push(maisProximo);
  });

  // 4. (Opcional) Só inclui os que vencem nos próximos 7 dias ou estão vencidos
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const result = proximos.filter(plano => {
    const dueDate = new Date(plano.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  console.log('filterTarotPlans - Próximos vencimentos únicos:', result.length);
  return result;
};
