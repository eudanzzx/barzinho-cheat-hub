
import { PlanoMensal } from "@/types/payment";

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  planoId?: string;
}

export const initializePlanoData = (
  totalMonths: number,
  baseDate: Date,
  dueDay: number,
  planos: any[],
  analysisId: string,
  clientName: string
): PlanoMonth[] => {
  console.log('initializePlanoMonths - Dia de vencimento configurado:', dueDay);
  
  const months: PlanoMonth[] = [];
  
  for (let i = 1; i <= totalMonths; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
    const actualDueDay = Math.min(dueDay, lastDayOfMonth);
    dueDate.setDate(actualDueDay);
    
    console.log(`initializePlanoMonths - Mês ${i}: ${dueDate.toISOString().split('T')[0]} (dia ${actualDueDay})`);
    
    const planoForMonth = planos.find((plano) => 
      plano.analysisId === analysisId &&
      plano.clientName === clientName && 
      plano.type === 'plano' &&
      'month' in plano &&
      plano.month === i && 
      'totalMonths' in plano &&
      plano.totalMonths === totalMonths
    );
    
    months.push({
      month: i,
      isPaid: planoForMonth ? !planoForMonth.active : false,
      dueDate: dueDate.toISOString().split('T')[0],
      paymentDate: planoForMonth?.created ? new Date(planoForMonth.created).toISOString().split('T')[0] : undefined,
      planoId: planoForMonth?.id
    });
  }
  
  return months;
};
