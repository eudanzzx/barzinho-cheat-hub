
import { useState, useEffect, useCallback } from "react";
import useUserDataService from "@/services/userDataService";
import { filterTarotPlans } from "./utils/tarotPlanFilters";
import { groupPaymentsByClient, GroupedPayment } from "./utils/paymentGrouping";
import { handleMarkAsPaid, handlePostponePayment, handleDeleteNotification } from "./utils/paymentActions";

export const usePaymentNotifications = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayment[]>([]);

  const checkTarotPaymentNotifications = useCallback(() => {
    console.log('usePaymentNotifications - Verificando notificações...');
    const allPlanos = getPlanos();
    console.log('usePaymentNotifications - Total de planos:', allPlanos.length);
    
    const pendingNotifications = filterTarotPlans(allPlanos);
    console.log('usePaymentNotifications - Notificações pendentes:', pendingNotifications.length);
    
    const grouped = groupPaymentsByClient(pendingNotifications);
    console.log('usePaymentNotifications - Grupos de pagamento:', grouped.length);
    
    setGroupedPayments(grouped);
  }, [getPlanos]);

  const markAsPaid = useCallback((notificationId: string) => {
    console.log('markAsPaid - Iniciando para ID:', notificationId);
    const allPlanos = getPlanos();
    const updatedPlanos = handleMarkAsPaid(notificationId, allPlanos, savePlanos);
    
    // Disparar eventos de sincronização múltiplos
    const triggerSyncEvents = () => {
      console.log('markAsPaid - Disparando eventos de sincronização...');
      
      // Eventos para sincronizar diferentes partes do sistema
      const events = [
        'tarot-payment-updated',
        'planosUpdated',
        'tarotAnalysesUpdated',
        'atendimentosUpdated',
        'paymentStatusChanged'
      ];
      
      events.forEach(eventName => {
        const event = new CustomEvent(eventName, { 
          detail: { 
            updatedId: notificationId,
            timestamp: Date.now(),
            action: 'mark_as_paid'
          }
        });
        window.dispatchEvent(event);
        console.log('markAsPaid - Evento disparado:', eventName);
      });

      // Disparar evento de storage para garantir sincronização
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'planos',
        newValue: JSON.stringify(updatedPlanos),
        url: window.location.href
      }));
    };

    // Disparar eventos múltiplas vezes para garantir sincronização
    triggerSyncEvents(); // Imediato
    setTimeout(triggerSyncEvents, 50); // 50ms
    setTimeout(triggerSyncEvents, 200); // 200ms
    setTimeout(triggerSyncEvents, 500); // 500ms

    // Refresh imediato das notificações
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 100);
  }, [getPlanos, savePlanos, checkTarotPaymentNotifications]);

  const postponePayment = useCallback((notificationId: string) => {
    console.log('postponePayment - Adiando pagamento:', notificationId);
    const allPlanos = getPlanos();
    handlePostponePayment(notificationId, allPlanos, savePlanos);
    
    // Disparar eventos de sincronização
    const triggerSyncEvents = () => {
      const events = [
        'tarot-payment-updated',
        'planosUpdated',
        'paymentStatusChanged'
      ];
      
      events.forEach(eventName => {
        const event = new CustomEvent(eventName, { 
          detail: { 
            updatedId: notificationId,
            action: 'postpone'
          }
        });
        window.dispatchEvent(event);
      });
    };

    triggerSyncEvents();
    setTimeout(triggerSyncEvents, 100);
    
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 150);
  }, [getPlanos, savePlanos, checkTarotPaymentNotifications]);

  const deleteNotification = useCallback((notificationId: string) => {
    console.log('deleteNotification - Excluindo notificação:', notificationId);
    const allPlanos = getPlanos();
    handleDeleteNotification(notificationId, allPlanos, savePlanos);
    
    // Disparar eventos de sincronização
    const triggerSyncEvents = () => {
      const events = [
        'tarot-payment-updated',
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
    };

    triggerSyncEvents();
    setTimeout(triggerSyncEvents, 100);
    
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 150);
  }, [getPlanos, savePlanos, checkTarotPaymentNotifications]);

  useEffect(() => {
    console.log('usePaymentNotifications - Inicializando...');
    checkTarotPaymentNotifications();
    
    const handlePaymentUpdate = (event?: CustomEvent) => {
      console.log('handlePaymentUpdate - Evento de atualização recebido', event?.detail);
      // Refresh com delay pequeno para garantir que os dados foram salvos
      setTimeout(() => {
        checkTarotPaymentNotifications();
      }, 50);
    };
    
    // Escuta múltiplos eventos para capturar todas as atualizações
    const eventNames = [
      'tarot-payment-updated',
      'planosUpdated',
      'paymentStatusChanged',
      'tarotAnalysesUpdated',
      'atendimentosUpdated'
    ];

    eventNames.forEach(eventName => {
      window.addEventListener(eventName, handlePaymentUpdate as EventListener);
    });
    
    return () => {
      eventNames.forEach(eventName => {
        window.removeEventListener(eventName, handlePaymentUpdate as EventListener);
      });
    };
  }, [checkTarotPaymentNotifications]);

  return {
    groupedPayments,
    markAsPaid,
    postponePayment,
    deleteNotification,
    refresh: checkTarotPaymentNotifications
  };
};
