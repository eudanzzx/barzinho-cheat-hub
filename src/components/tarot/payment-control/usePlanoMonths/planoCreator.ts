
import { PlanoMensal } from "@/types/payment";

export const createNewPlano = (
  analysisId: string,
  clientName: string,
  month: number,
  planoData: { meses: string; valorMensal: string; diaVencimento?: string },
  calculatedDueDate: string
): PlanoMensal => {
  console.log('createNewPlano - Criando plano mensal:', {
    analysisId,
    clientName,
    month,
    totalMonths: parseInt(planoData.meses),
    calculatedDueDate,
    amount: parseFloat(planoData.valorMensal)
  });

  return {
    id: `${analysisId}-month-${month}-${Date.now()}`,
    clientName: clientName,
    type: 'plano',
    amount: parseFloat(planoData.valorMensal),
    dueDate: calculatedDueDate, // Usar a data calculada exatamente como passada
    month: month,
    totalMonths: parseInt(planoData.meses),
    created: new Date().toISOString(),
    active: false, // Marcado como pago (inativo)
    notificationTiming: 'on_due_date',
    analysisId: analysisId
  };
};
