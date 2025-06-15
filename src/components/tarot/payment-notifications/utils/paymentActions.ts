
import { toast } from "sonner";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const createNextPayment = (
  currentPlano: PlanoMensal | PlanoSemanal,
  allPlanos: (PlanoMensal | PlanoSemanal)[]
): PlanoMensal | PlanoSemanal | null => {
  if (currentPlano.type === 'plano' && 'month' in currentPlano && 'totalMonths' in currentPlano) {
    const currentMonth = currentPlano.month;
    const totalMonths = currentPlano.totalMonths;
    
    if (currentMonth < totalMonths) {
      const nextDueDate = new Date(currentPlano.dueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      
      const nextPlano: PlanoMensal = {
        id: `${currentPlano.analysisId}-month-${currentMonth + 1}-${Date.now()}`,
        clientName: currentPlano.clientName,
        type: 'plano',
        amount: currentPlano.amount,
        dueDate: nextDueDate.toISOString().split('T')[0],
        month: currentMonth + 1,
        totalMonths: totalMonths,
        created: new Date().toISOString(),
        active: true,
        notificationTiming: currentPlano.notificationTiming || 'on_due_date',
        analysisId: currentPlano.analysisId
      };
      
      return nextPlano;
    }
  } else if (currentPlano.type === 'semanal') {
    const currentWeek = currentPlano.week || 1;
    const totalWeeks = currentPlano.totalWeeks || 1;
    
    if (currentWeek < totalWeeks) {
      const nextDueDate = new Date(currentPlano.dueDate);
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      
      const nextPlano: PlanoSemanal = {
        id: `${currentPlano.analysisId}-week-${currentWeek + 1}-${Date.now()}`,
        clientName: currentPlano.clientName,
        type: 'semanal',
        amount: currentPlano.amount,
        dueDate: nextDueDate.toISOString().split('T')[0],
        week: currentWeek + 1,
        totalWeeks: totalWeeks,
        created: new Date().toISOString(),
        active: true,
        notificationTiming: currentPlano.notificationTiming || 'on_due_date',
        analysisId: currentPlano.analysisId
      };
      
      return nextPlano;
    }
  }
  
  return null;
};

export const handleMarkAsPaid = (
  notificationId: string,
  allPlanos: (PlanoMensal | PlanoSemanal)[],
  savePlanos: (planos: (PlanoMensal | PlanoSemanal)[]) => void
) => {
  const currentPlano = allPlanos.find(plano => plano.id === notificationId);
  
  if (!currentPlano) {
    toast.error("Plano não encontrado!");
    return allPlanos;
  }

  // Mark current payment as paid (inactive)
  const updatedPlanos = allPlanos.map(plano => 
    plano.id === notificationId ? { ...plano, active: false } : plano
  );

  // Create next payment if applicable
  const nextPayment = createNextPayment(currentPlano, allPlanos);
  
  if (nextPayment) {
    updatedPlanos.push(nextPayment);
    const nextDueDate = new Date(nextPayment.dueDate);
    toast.success(`Pagamento marcado como pago! Próximo vencimento: ${nextDueDate.toLocaleDateString('pt-BR')}`);
  } else {
    const paymentType = currentPlano.type === 'plano' ? 'plano' : 'semanal';
    toast.success(`Último pagamento do ${paymentType} marcado como pago!`);
  }
  
  savePlanos(updatedPlanos);
  
  // Disparar evento customizado para notificar que houve mudança nos pagamentos do tarot
  window.dispatchEvent(new Event('tarot-payment-updated'));
  
  return updatedPlanos;
};

export const handlePostponePayment = (
  notificationId: string,
  allPlanos: (PlanoMensal | PlanoSemanal)[],
  savePlanos: (planos: (PlanoMensal | PlanoSemanal)[]) => void
) => {
  const updatedPlanos = allPlanos.map(plano => {
    if (plano.id === notificationId) {
      if (plano.type === 'plano') {
        const newDueDate = new Date(plano.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 7);
        return { ...plano, dueDate: newDueDate.toISOString().split('T')[0] };
      }
    }
    return plano;
  });
  
  savePlanos(updatedPlanos);
  toast.info("Pagamento do tarot adiado por 7 dias");
  
  // Disparar evento customizado
  window.dispatchEvent(new Event('tarot-payment-updated'));
  
  return updatedPlanos;
};

export const handleDeleteNotification = (
  notificationId: string,
  allPlanos: (PlanoMensal | PlanoSemanal)[],
  savePlanos: (planos: (PlanoMensal | PlanoSemanal)[]) => void
) => {
  const updatedPlanos = allPlanos.filter(plano => plano.id !== notificationId);
  savePlanos(updatedPlanos);
  toast.success("Notificação de pagamento excluída!");
  
  // Disparar evento customizado
  window.dispatchEvent(new Event('tarot-payment-updated'));
  
  return updatedPlanos;
};
