
import { useState, useEffect, useCallback } from "react";
import useUserDataService from "@/services/userDataService";
import { filterTarotPlans } from "./utils/tarotPlanFilters";
import { groupPaymentsByClient, GroupedPayment } from "./utils/paymentGrouping";
import { handleMarkAsPaid, handlePostponePayment, handleDeleteNotification } from "./utils/paymentActions";
import { useDebounceCallback } from "@/hooks/useDebounceCallback";

export const usePaymentNotifications = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayment[]>([]);

  const checkTarotPaymentNotifications = useCallback(() => {
    console.log('usePaymentNotifications - Verificando notificações...');
    try {
      const allPlanos = getPlanos();
      console.log('usePaymentNotifications - Total de planos encontrados:', allPlanos.length);
      
      if (allPlanos.length > 0) {
        console.log('usePaymentNotifications - Primeiros 3 planos:', allPlanos.slice(0, 3));
      }
      
      const pendingNotifications = filterTarotPlans(allPlanos);
      console.log('usePaymentNotifications - Notificações pendentes de tarot:', pendingNotifications.length);
      
      if (pendingNotifications.length > 0) {
        console.log('usePaymentNotifications - Primeiras notificações:', pendingNotifications.slice(0, 2));
      }
      
      const grouped = groupPaymentsByClient(pendingNotifications);
      console.log('usePaymentNotifications - Grupos de pagamento criados:', grouped.length);
      
      setGroupedPayments(grouped);
    } catch (error) {
      console.error('usePaymentNotifications - Erro ao verificar notificações:', error);
      setGroupedPayments([]);
    }
  }, [getPlanos]);

  const debouncedCheck = useDebounceCallback(checkTarotPaymentNotifications, 100);

  const markAsPaid = useCallback((notificationId: string) => {
    console.log('markAsPaid - Iniciando para ID:', notificationId);
    try {
      const allPlanos = getPlanos();
      handleMarkAsPaid(notificationId, allPlanos, savePlanos);
      
      // Disparar eventos de sincronização IMEDIATAMENTE
      const triggerSyncEvents = () => {
        console.log('markAsPaid - Disparando eventos de sincronização...');
        
        const events = [
          'tarot-payment-updated',
          'planosUpdated',
          'tarotAnalysesUpdated',
          'atendimentosUpdated',
          'paymentStatusChanged',
          'monthlyPaymentsUpdated'
        ];
        
        events.forEach(eventName => {
          const event = new CustomEvent(eventName, { 
            detail: { 
              updatedId: notificationId,
              timestamp: Date.now(),
              action: 'mark_as_paid',
              triggeredBy: 'tarot-payment-notifications'
            }
          });
          window.dispatchEvent(event);
        });

        // Disparar evento customizado para modal principal
        const customEvent = new CustomEvent('mark-payment-as-paid', {
          detail: { id: notificationId }
        });
        window.dispatchEvent(customEvent);
      };

      // Disparar eventos IMEDIATAMENTE
      triggerSyncEvents();
      
      // Verificar novamente após pequeno delay
      setTimeout(() => {
        triggerSyncEvents();
        debouncedCheck();
      }, 100);
    } catch (error) {
      console.error('markAsPaid - Erro:', error);
    }
  }, [getPlanos, savePlanos, debouncedCheck]);

  const postponePayment = useCallback((notificationId: string) => {
    console.log('postponePayment - Adiando pagamento:', notificationId);
    try {
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
        debouncedCheck();
      }, 150);
    } catch (error) {
      console.error('postponePayment - Erro:', error);
    }
  }, [getPlanos, savePlanos, debouncedCheck]);

  const deleteNotification = useCallback((notificationId: string) => {
    console.log('deleteNotification - Excluindo notificação:', notificationId);
    try {
      const allPlanos = getPlanos();
      handleDeleteNotification(notificationId, allPlanos, savePlanos);
      
      // Disparar eventos de sincronização
      const triggerSyncEvents = () => {
        const events = [
          'tarot-payment-updated',
          'planosUpdated',
          'paymentStatusChanged',
          'atendimentosUpdated',
          'monthlyPaymentsUpdated'
        ];
        
        events.forEach(eventName => {
          const event = new CustomEvent(eventName, { 
            detail: { 
              deletedId: notificationId,
              action: 'delete',
              triggeredBy: 'tarot-payment-notifications'
            }
          });
          window.dispatchEvent(event);
        });

        // Disparar evento customizado para modal principal
        const customEvent = new CustomEvent('delete-payment-notification', {
          detail: { id: notificationId }
        });
        window.dispatchEvent(customEvent);
      };

      triggerSyncEvents();
      setTimeout(() => {
        triggerSyncEvents();
        debouncedCheck();
      }, 100);
    } catch (error) {
      console.error('deleteNotification - Erro:', error);
    }
  }, [getPlanos, savePlanos, debouncedCheck]);

  useEffect(() => {
    console.log('usePaymentNotifications - Inicializando...');
    checkTarotPaymentNotifications();
    
    const handlePaymentUpdate = (event?: CustomEvent) => {
      console.log('handlePaymentUpdate - Evento de atualização recebido', event?.detail);
      debouncedCheck();
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
  }, [checkTarotPaymentNotifications, debouncedCheck]);

  return {
    groupedPayments,
    markAsPaid,
    postponePayment,
    deleteNotification,
    refresh: checkTarotPaymentNotifications
  };
};
