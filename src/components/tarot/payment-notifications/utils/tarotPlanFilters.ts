
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export const filterTarotPlans = (allPlanos: (PlanoMensal | PlanoSemanal)[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter for tarot plans - only active (unpaid) ones with analysisId
  const tarotPlanos = allPlanos.filter((plano) => 
    plano.active === true && 
    !!plano.analysisId
  );

  const pendingNotifications: (PlanoMensal | PlanoSemanal)[] = [];

  // Check monthly plans
  const tarotMonthlyPlanos = tarotPlanos.filter((plano): plano is PlanoMensal => 
    plano.type === 'plano' && 'month' in plano && 'totalMonths' in plano
  );

  tarotMonthlyPlanos.forEach(plano => {
    const dueDate = new Date(plano.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const notificationTiming = plano.notificationTiming || 'on_due_date';
    
    if (notificationTiming === 'on_due_date') {
      if (dueDate.getTime() <= today.getTime()) {
        pendingNotifications.push(plano);
      }
    } else if (notificationTiming === 'next_week') {
      const nextWeekDate = new Date(dueDate);
      nextWeekDate.setDate(nextWeekDate.getDate() + 7);
      nextWeekDate.setHours(0, 0, 0, 0);
      
      if (nextWeekDate.getTime() <= today.getTime()) {
        pendingNotifications.push(plano);
      }
    }
  });

  // Check weekly plans
  const tarotWeeklyPlanos = tarotPlanos.filter((plano): plano is PlanoSemanal => 
    plano.type === 'semanal'
  );

  // For weekly plans, show notifications based on due date, not day of week
  tarotWeeklyPlanos.forEach(plano => {
    const dueDate = new Date(plano.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const notificationTiming = plano.notificationTiming || 'on_due_date';
    
    if (notificationTiming === 'on_due_date') {
      // Show notification on or after the due date
      if (dueDate.getTime() <= today.getTime()) {
        pendingNotifications.push(plano);
      }
    } else if (notificationTiming === 'next_week') {
      const nextWeekDate = new Date(dueDate);
      nextWeekDate.setDate(nextWeekDate.getDate() + 7);
      
      if (nextWeekDate.getTime() <= today.getTime()) {
        pendingNotifications.push(plano);
      }
    }
  });

  return pendingNotifications;
};
