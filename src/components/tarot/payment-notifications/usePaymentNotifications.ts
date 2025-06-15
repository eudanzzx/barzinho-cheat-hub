import { useState, useEffect } from "react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

interface GroupedPayment {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  totalPayments: number;
}

export const usePaymentNotifications = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayment[]>([]);

  const checkTarotPaymentNotifications = () => {
    const allPlanos = getPlanos();
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

    // Group payments by client
    const grouped = groupPaymentsByClient(pendingNotifications);
    setGroupedPayments(grouped);
  };

  const groupPaymentsByClient = (payments: (PlanoMensal | PlanoSemanal)[]): GroupedPayment[] => {
    const clientGroups = new Map<string, (PlanoMensal | PlanoSemanal)[]>();
    
    payments.forEach(payment => {
      const existing = clientGroups.get(payment.clientName) || [];
      existing.push(payment);
      clientGroups.set(payment.clientName, existing);
    });

    const groupedPayments: GroupedPayment[] = [];
    
    clientGroups.forEach((clientPayments, clientName) => {
      const sortedPayments = clientPayments.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

      const mostUrgent = sortedPayments[0];
      const additionalPayments = sortedPayments.slice(1);

      groupedPayments.push({
        clientName,
        mostUrgent,
        additionalPayments,
        totalPayments: sortedPayments.length
      });
    });

    return groupedPayments.sort((a, b) => 
      new Date(a.mostUrgent.dueDate).getTime() - new Date(b.mostUrgent.dueDate).getTime()
    );
  };

  const markAsPaid = (notificationId: string) => {
    const allPlanos = getPlanos();
    const currentPlano = allPlanos.find(plano => plano.id === notificationId);
    
    if (!currentPlano) {
      toast.error("Plano não encontrado!");
      return;
    }

    // Mark current payment as paid (inactive)
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === notificationId ? { ...plano, active: false } : plano
    );

    // For monthly plans, create next month's payment if not the last month
    if (currentPlano.type === 'plano' && 'month' in currentPlano && 'totalMonths' in currentPlano) {
      const currentMonth = currentPlano.month;
      const totalMonths = currentPlano.totalMonths;
      
      if (currentMonth < totalMonths) {
        // Create next month's payment
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
        
        updatedPlanos.push(nextPlano);
        toast.success(`Pagamento marcado como pago! Próximo vencimento: ${nextDueDate.toLocaleDateString('pt-BR')}`);
      } else {
        toast.success("Último pagamento do plano marcado como pago!");
      }
    } 
    // For weekly plans, create next week's payment
    else if (currentPlano.type === 'semanal') {
      const currentWeek = currentPlano.week || 1;
      const totalWeeks = currentPlano.totalWeeks || 1;
      
      if (currentWeek < totalWeeks) {
        // Create next week's payment
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
        
        updatedPlanos.push(nextPlano);
        toast.success(`Pagamento semanal marcado como pago! Próxima semana: ${nextDueDate.toLocaleDateString('pt-BR')}`);
      } else {
        toast.success("Último pagamento semanal marcado como pago!");
      }
    }
    
    savePlanos(updatedPlanos);
    
    // Force refresh
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 100);
  };

  const postponePayment = (notificationId: string) => {
    const allPlanos = getPlanos();
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
    
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 100);
    
    toast.info("Pagamento do tarot adiado por 7 dias");
  };

  const deleteNotification = (notificationId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.filter(plano => plano.id !== notificationId);
    
    savePlanos(updatedPlanos);
    
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 100);
    
    toast.success("Notificação de pagamento excluída!");
  };

  useEffect(() => {
    checkTarotPaymentNotifications();
    
    // Listen for payment updates from control components
    const handlePaymentUpdate = () => {
      setTimeout(() => {
        checkTarotPaymentNotifications();
      }, 200);
    };
    
    window.addEventListener('tarot-payment-updated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('tarot-payment-updated', handlePaymentUpdate);
    };
  }, []);

  return {
    groupedPayments,
    markAsPaid,
    postponePayment,
    deleteNotification
  };
};
