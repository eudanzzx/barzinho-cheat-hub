import { useState, useEffect, useCallback } from "react";
import useUserDataService from "@/services/userDataService";
import { filterMainPlans } from "@/components/main-payment-notifications/utils/mainPlanFilters";
import { groupPaymentsByClient, GroupedPayment } from "@/components/tarot/payment-notifications/utils/paymentGrouping";
import { useThrottle } from "@/hooks/useThrottle";

export const useMainPaymentNotifications = () => {
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayment[]>([]);

  const checkMainPaymentNotifications = useCallback(() => {
    // Obter todos os atendimentos existentes para validar quais clientes ainda existem
    const allAtendimentos = getAtendimentos();
    const existingClientNames = new Set<string>();
    allAtendimentos.forEach((a: any) => {
      if (a.nome && typeof a.nome === 'string') {
        existingClientNames.add(a.nome);
      }
    });
    
    const allPlanos = getPlanos();
    
    // Filtrar apenas planos principais de clientes que ainda existem
    const mainPlans = filterMainPlans(allPlanos, existingClientNames);
    
    // Mostrar TODOS os planos ativos (sem filtro de tempo)
    const pendingNotifications = mainPlans;
    
    const grouped = groupPaymentsByClient(pendingNotifications);
    
    // Ordenar por vencimento mais próximo e limitar a 20
    const sortedAndLimited = grouped
      .sort((a, b) => 
        new Date(a.mostUrgent.dueDate).getTime() - new Date(b.mostUrgent.dueDate).getTime()
      )
      .slice(0, 20);
    
    setGroupedPayments(sortedAndLimited);
  }, [getPlanos, getAtendimentos]);

  const throttledCheck = useThrottle(checkMainPaymentNotifications, 250);

  const markAsPaid = useCallback((notificationId: string) => {
    const allPlanos = getPlanos();
    
    const updatedPlanos = allPlanos.map(plano => {
      if (plano.id === notificationId) {
        return { ...plano, active: false, paidAt: new Date().toISOString() };
      }
      return plano;
    });
    
    savePlanos(updatedPlanos);
    
    // Disparar eventos de sincronização
    const events = [
      'main-payment-updated',
      'planosUpdated',
      'atendimentosUpdated',
      'paymentStatusChanged'
    ];
    
    events.forEach(eventName => {
      const event = new CustomEvent(eventName, { 
        detail: { 
          updatedId: notificationId,
          action: 'mark_as_paid',
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);
    });
    
    // Refresh das notificações
    setTimeout(() => {
      throttledCheck();
    }, 100);
  }, [getPlanos, savePlanos, throttledCheck]);

  const deleteNotification = useCallback((notificationId: string) => {
    const allPlanos = getPlanos();
    
    const updatedPlanos = allPlanos.filter(plano => plano.id !== notificationId);
    savePlanos(updatedPlanos);
    
    // Disparar eventos de sincronização
    const events = [
      'main-payment-updated',
      'planosUpdated',
      'paymentStatusChanged'
    ];
    
    events.forEach(eventName => {
      const event = new CustomEvent(eventName, { 
        detail: { 
          deletedId: notificationId,
          action: 'delete'
        }
      });
      window.dispatchEvent(event);
    });
    
    // Refresh das notificações
    setTimeout(() => {
      throttledCheck();
    }, 100);
  }, [getPlanos, savePlanos, throttledCheck]);


  useEffect(() => {
    checkMainPaymentNotifications();
    
    const handlePaymentUpdate = () => {
      throttledCheck();
    };

    const handleMarkAsPaid = (event: CustomEvent) => {
      if (event.detail?.id) {
        markAsPaid(event.detail.id);
      }
    };

    const handleDeleteNotification = (event: CustomEvent) => {
      if (event.detail?.id) {
        deleteNotification(event.detail.id);
      }
    };
    
    // Escuta múltiplos eventos para capturar todas as atualizações
    const eventNames = [
      'main-payment-updated',
      'planosUpdated',
      'paymentStatusChanged',
      'atendimentosUpdated'
    ];

    eventNames.forEach(eventName => {
      window.addEventListener(eventName, handlePaymentUpdate as EventListener);
    });

    // Escutar eventos do modal de detalhes e controle de pagamentos
    window.addEventListener('mark-payment-as-paid', handleMarkAsPaid as EventListener);
    window.addEventListener('delete-payment-notification', handleDeleteNotification as EventListener);
    window.addEventListener('main-payment-updated', handlePaymentUpdate as EventListener);
    window.addEventListener('paymentStatusChanged', handlePaymentUpdate as EventListener);
    
    return () => {
      eventNames.forEach(eventName => {
        window.removeEventListener(eventName, handlePaymentUpdate as EventListener);
      });
      window.removeEventListener('mark-payment-as-paid', handleMarkAsPaid as EventListener);
      window.removeEventListener('delete-payment-notification', handleDeleteNotification as EventListener);
      window.removeEventListener('main-payment-updated', handlePaymentUpdate as EventListener);
      window.removeEventListener('paymentStatusChanged', handlePaymentUpdate as EventListener);
    };
  }, [throttledCheck, markAsPaid, deleteNotification]);

  return {
    groupedPayments,
    markAsPaid,
    deleteNotification,
    refresh: checkMainPaymentNotifications
  };
};