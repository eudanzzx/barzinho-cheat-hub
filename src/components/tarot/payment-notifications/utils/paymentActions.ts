import { toast } from "sonner";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const createNextPayment = (
  currentPlano: PlanoMensal | PlanoSemanal,
  allPlanos: (PlanoMensal | PlanoSemanal)[]
): PlanoMensal | PlanoSemanal | null => {
  console.log('createNextPayment - currentPlano:', currentPlano);
  
  if (currentPlano.type === 'plano' && 'month' in currentPlano && 'totalMonths' in currentPlano) {
    const currentMonth = currentPlano.month;
    const totalMonths = currentPlano.totalMonths;
    
    console.log(`createNextPayment - Mês atual: ${currentMonth}, Total: ${totalMonths}`);
    
    if (currentMonth < totalMonths) {
      // Calcular a próxima data de vencimento
      const currentDueDate = new Date(currentPlano.dueDate);
      const nextDueDate = new Date(currentDueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      
      // Garantir que mantemos o mesmo dia do mês
      const originalDay = currentDueDate.getDate();
      nextDueDate.setDate(originalDay);
      
      // Se o dia mudou (ex: 31 de janeiro -> 28 de fevereiro), ajustar para o último dia do mês
      if (nextDueDate.getDate() !== originalDay) {
        nextDueDate.setDate(0); // Vai para o último dia do mês anterior
      }
      
      const nextDueDateStr = nextDueDate.toISOString().split('T')[0];
      
      // **CHECAGEM CRÍTICA: já existe um pagamento ativo para mesmo analysisId e data de vencimento?**
      const exists = allPlanos.some(
        plano =>
          plano.active &&
          plano.analysisId === currentPlano.analysisId &&
          plano.dueDate === nextDueDateStr &&
          plano.type === 'plano'
      );
      if (exists) {
        console.warn("createNextPayment - Pagamento já existente para o próximo vencimento, não duplica.");
        return null;
      }
      
      const nextPlano: PlanoMensal = {
        id: `${currentPlano.analysisId}-month-${currentMonth + 1}-${Date.now()}`,
        clientName: currentPlano.clientName,
        type: 'plano',
        amount: currentPlano.amount,
        dueDate: nextDueDateStr,
        month: currentMonth + 1,
        totalMonths: totalMonths,
        created: new Date().toISOString(),
        active: true,
        notificationTiming: currentPlano.notificationTiming || 'on_due_date',
        analysisId: currentPlano.analysisId
      };
      
      console.log('createNextPayment - Próximo plano criado:', nextPlano);
      console.log('createNextPayment - Nova data de vencimento:', nextPlano.dueDate);
      return nextPlano;
    }
  } else if (currentPlano.type === 'semanal') {
    const currentWeek = currentPlano.week || 1;
    const totalWeeks = currentPlano.totalWeeks || 1;
    
    if (currentWeek < totalWeeks) {
      const currentDueDate = new Date(currentPlano.dueDate);
      const nextDueDate = new Date(currentDueDate);
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      
      const nextDueDateStr = nextDueDate.toISOString().split('T')[0];
      
      // **CHECAGEM CRÍTICA: já existe um pagamento ativo para mesmo analysisId e data de vencimento?**
      const exists = allPlanos.some(
        plano =>
          plano.active &&
          plano.analysisId === currentPlano.analysisId &&
          plano.dueDate === nextDueDateStr &&
          plano.type === 'semanal'
      );
      if (exists) {
        console.warn("createNextPayment - Pagamento já existente para o próximo vencimento, não duplica (semanal).");
        return null;
      }
      
      const nextPlano: PlanoSemanal = {
        id: `${currentPlano.analysisId}-week-${currentWeek + 1}-${Date.now()}`,
        clientName: currentPlano.clientName,
        type: 'semanal',
        amount: currentPlano.amount,
        dueDate: nextDueDateStr,
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
  
  console.log('createNextPayment - Nenhum próximo pagamento criado (último pagamento do plano)');
  return null;
};

export const handleMarkAsPaid = (
  notificationId: string,
  allPlanos: (PlanoMensal | PlanoSemanal)[],
  savePlanos: (planos: (PlanoMensal | PlanoSemanal)[]) => void
) => {
  console.log('handleMarkAsPaid - Iniciando para ID:', notificationId);
  
  const currentPlano = allPlanos.find(plano => plano.id === notificationId);
  
  if (!currentPlano) {
    console.error('handleMarkAsPaid - Plano não encontrado:', notificationId);
    toast.error("Plano não encontrado!");
    return allPlanos;
  }

  console.log('handleMarkAsPaid - Plano encontrado:', currentPlano);

  // Marcar pagamento atual como pago (inativo)
  let updatedPlanos = allPlanos.map(plano => 
    plano.id === notificationId ? { ...plano, active: false } : plano
  );

  console.log('handleMarkAsPaid - Plano marcado como inativo');

  // Criar próximo pagamento se aplicável
  const nextPayment = createNextPayment(currentPlano, allPlanos);
  
  if (nextPayment) {
    updatedPlanos.push(nextPayment);
    const nextDueDate = new Date(nextPayment.dueDate);
    console.log('handleMarkAsPaid - Próximo pagamento criado e adicionado:', nextPayment);
    console.log('handleMarkAsPaid - Total de planos após adicionar:', updatedPlanos.length);
    toast.success(`Pagamento marcado como pago! Próximo vencimento: ${nextDueDate.toLocaleDateString('pt-BR')}`);
  } else {
    const paymentType = currentPlano.type === 'plano' ? 'plano mensal' : 'plano semanal';
    console.log('handleMarkAsPaid - Último pagamento do plano');
    toast.success(`Último pagamento do ${paymentType} marcado como pago!`);
  }
  
  console.log('handleMarkAsPaid - Salvando planos atualizados. Total:', updatedPlanos.length);
  savePlanos(updatedPlanos);
  
  // Forçar atualização imediata dos eventos
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('tarot-payment-updated', { 
      detail: { updated: true, action: 'markAsPaid', id: notificationId, timestamp: Date.now() } 
    }));
    window.dispatchEvent(new CustomEvent('planosUpdated', { 
      detail: { updated: true, action: 'markAsPaid', id: notificationId, timestamp: Date.now() } 
    }));
  }, 50);
  
  return updatedPlanos;
};

export const handlePostponePayment = (
  notificationId: string,
  allPlanos: (PlanoMensal | PlanoSemanal)[],
  savePlanos: (planos: (PlanoMensal | PlanoSemanal)[]) => void
) => {
  console.log('handlePostponePayment - Adiando pagamento:', notificationId);
  
  const updatedPlanos = allPlanos.map(plano => {
    if (plano.id === notificationId) {
      if (plano.type === 'plano') {
        const newDueDate = new Date(plano.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 7);
        console.log('handlePostponePayment - Nova data:', newDueDate.toISOString().split('T')[0]);
        return { ...plano, dueDate: newDueDate.toISOString().split('T')[0] };
      }
    }
    return plano;
  });
  
  savePlanos(updatedPlanos);
  toast.info("Pagamento do tarot adiado por 7 dias");
  
  return updatedPlanos;
};

export const handleDeleteNotification = (
  notificationId: string,
  allPlanos: (PlanoMensal | PlanoSemanal)[],
  savePlanos: (planos: (PlanoMensal | PlanoSemanal)[]) => void
) => {
  console.log('handleDeleteNotification - Excluindo notificação:', notificationId);

  // Filtro reforçado: remove TODOS planos que tenham esse mesmo ID
  const updatedPlanos = allPlanos.filter(plano => plano.id !== notificationId);

  // Checagem extra de segurança
  const stillPresent = updatedPlanos.find(p => p.id === notificationId);
  if (stillPresent) {
    console.error('handleDeleteNotification - Falha ao remover plano, ID ainda presente:', notificationId);
  } else {
    console.log('handleDeleteNotification - Plano removido com sucesso:', notificationId);
  }

  savePlanos(updatedPlanos);
  toast.success("Notificação de pagamento excluída!");

  // Forçar atualização dos eventos
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('tarot-payment-updated', { 
      detail: { updated: true, action: 'deleteNotification', id: notificationId, timestamp: Date.now() } 
    }));
    window.dispatchEvent(new CustomEvent('planosUpdated', { 
      detail: { updated: true, action: 'deleteNotification', id: notificationId, timestamp: Date.now() } 
    }));
  }, 50);

  return updatedPlanos;
};
