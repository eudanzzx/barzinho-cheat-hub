import { useState, useEffect, useCallback } from "react";
import useUserDataService from "@/services/userDataService";
import { filterMainPlans } from "@/components/main-payment-notifications/utils/mainPlanFilters";
import { groupPaymentsByClient, GroupedPayment } from "@/components/tarot/payment-notifications/utils/paymentGrouping";

export const useMainPaymentNotifications = () => {
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayment[]>([]);

  const checkMainPaymentNotifications = useCallback(() => {
    console.log('useMainPaymentNotifications - Verificando notificações...');
    
    // Obter todos os atendimentos existentes para validar quais clientes ainda existem
    const allAtendimentos = getAtendimentos();
    const existingClientNames = new Set(allAtendimentos.map(a => a.nome));
    
    console.log('useMainPaymentNotifications - Clientes existentes:', existingClientNames.size);
    
    const allPlanos = getPlanos();
    console.log('useMainPaymentNotifications - Total de planos:', allPlanos.length);
    
    // Filtrar apenas planos principais de clientes que ainda existem
    const mainPlans = filterMainPlans(allPlanos, existingClientNames);
    console.log('useMainPaymentNotifications - Planos principais válidos:', mainPlans.length);
    
    // Mostrar TODOS os planos ativos (sem filtro de tempo)
    const pendingNotifications = mainPlans;
    
    console.log('useMainPaymentNotifications - Notificações pendentes:', pendingNotifications.length);
    
    const grouped = groupPaymentsByClient(pendingNotifications);
    console.log('useMainPaymentNotifications - Grupos de pagamento:', grouped.length);
    
    setGroupedPayments(grouped);
  }, [getPlanos, getAtendimentos]);

  const markAsPaid = useCallback((notificationId: string) => {
    console.log('markAsPaid - Marcando como pago:', notificationId);
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
      checkMainPaymentNotifications();
    }, 100);
  }, [getPlanos, savePlanos, checkMainPaymentNotifications]);

  const deleteNotification = useCallback((notificationId: string) => {
    console.log('deleteNotification - Excluindo notificação:', notificationId);
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
      checkMainPaymentNotifications();
    }, 100);
  }, [getPlanos, savePlanos, checkMainPaymentNotifications]);


  useEffect(() => {
    console.log('useMainPaymentNotifications - Inicializando...');
    checkMainPaymentNotifications();
    
    const handlePaymentUpdate = (event?: CustomEvent) => {
      console.log('handlePaymentUpdate - Evento de atualização recebido', event?.detail);
      setTimeout(() => {
        checkMainPaymentNotifications();
      }, 50);
    };

    const handleMarkAsPaid = (event: CustomEvent) => {
      console.log('handleMarkAsPaid - Evento recebido:', event.detail);
      if (event.detail?.id) {
        markAsPaid(event.detail.id);
      }
    };

    const handleDeleteNotification = (event: CustomEvent) => {
      console.log('handleDeleteNotification - Evento recebido:', event.detail);
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
  }, [checkMainPaymentNotifications, markAsPaid, deleteNotification]);

  return {
    groupedPayments,
    markAsPaid,
    deleteNotification,
    refresh: checkMainPaymentNotifications
  };
};