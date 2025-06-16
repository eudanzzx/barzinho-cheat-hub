
import { PlanoMensal } from "@/types/payment";

export const createNewPlano = (
  analysisId: string,
  clientName: string,
  month: number,
  planoData: { meses: string; valorMensal: string; diaVencimento?: string },
  dueDate: string
): PlanoMensal => {
  return {
    id: `${analysisId}-month-${month}-${Date.now()}`,
    clientName: clientName,
    type: 'plano',
    amount: parseFloat(planoData.valorMensal),
    dueDate: dueDate,
    month: month,
    totalMonths: parseInt(planoData.meses),
    created: new Date().toISOString(),
    active: false, // Marcado como pago (inativo)
    notificationTiming: 'on_due_date',
    analysisId: analysisId
  };
};
