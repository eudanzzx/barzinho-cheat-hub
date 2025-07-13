
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
  console.log('initializePlanoData - Configurações:', {
    totalMonths,
    baseDate: baseDate.toISOString(),
    dueDay,
    analysisId,
    clientName
  });
  
  const months: PlanoMonth[] = [];
  
  for (let i = 1; i <= totalMonths; i++) {
    // Calcular data de vencimento de forma mais precisa
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    // Ajustar para o dia de vencimento correto
    const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
    const actualDueDay = Math.min(dueDay, lastDayOfMonth);
    dueDate.setDate(actualDueDay);
    
    // Garantir que a data está no formato correto (YYYY-MM-DD)
    const dueDateString = dueDate.toISOString().split('T')[0];
    
    console.log(`initializePlanoData - Mês ${i}/${totalMonths}: calculado ${dueDateString} (dia ${actualDueDay})`);
    
    // Procurar plano correspondente de forma mais flexível
    const planoForMonth = planos.find((plano) => {
      const isCorrectAnalysis = plano.analysisId === analysisId;
      const isCorrectClient = plano.clientName === clientName;
      const isMonthlyPlan = plano.type === 'plano';
      const isCorrectMonth = 'month' in plano && plano.month === i;
      const isCorrectTotal = 'totalMonths' in plano && plano.totalMonths === totalMonths;
      
      // Verificar também se a data de vencimento bate (com tolerância de 1 dia)
      let isCorrectDate = false;
      if (plano.dueDate) {
        const planoDate = new Date(plano.dueDate);
        const diffInDays = Math.abs((planoDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        isCorrectDate = diffInDays <= 1; // Tolerância de 1 dia
      }
      
      const match = isCorrectAnalysis && isCorrectClient && isMonthlyPlan && isCorrectMonth && isCorrectTotal;
      
      if (match) {
        console.log(`initializePlanoData - Plano encontrado para mês ${i}:`, {
          planoId: plano.id,
          planoDueDate: plano.dueDate,
          calculatedDueDate: dueDateString,
          isCorrectDate,
          planoActive: plano.active
        });
      }
      
      return match;
    });
    
    // Determinar se está pago baseado no status ativo do plano
    const isPaid = planoForMonth ? !Boolean(planoForMonth.active === true || planoForMonth.active === 'true' || planoForMonth.active === '1') : false;
    
    months.push({
      month: i,
      isPaid,
      dueDate: dueDateString,
      paymentDate: planoForMonth?.created ? new Date(planoForMonth.created).toISOString().split('T')[0] : undefined,
      planoId: planoForMonth?.id
    });
    
    console.log(`initializePlanoData - Mês ${i} configurado:`, {
      isPaid,
      dueDate: dueDateString,
      planoId: planoForMonth?.id
    });
  }
  
  console.log(`initializePlanoData - Total de ${months.length} meses criados`);
  return months;
};
