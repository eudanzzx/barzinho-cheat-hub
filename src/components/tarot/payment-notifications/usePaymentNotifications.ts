
import { useState, useEffect, useCallback } from "react";
import useUserDataService from "@/services/userDataService";
import { filterTarotPlans } from "./utils/tarotPlanFilters";
import { groupPaymentsByClient, GroupedPayment } from "./utils/paymentGrouping";
import { handleMarkAsPaid, handlePostponePayment, handleDeleteNotification } from "./utils/paymentActions";
import { useDebounceCallback } from "@/hooks/useDebounceCallback";

export const usePaymentNotifications = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayment[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const checkTarotPaymentNotifications = useCallback(() => {
    console.log('usePaymentNotifications - Verificando notificações...', new Date().toISOString());
    try {
      const allPlanos = getPlanos();
      console.log('usePaymentNotifications - Total de planos encontrados:', allPlanos.length);
      
      if (allPlanos.length > 0) {
        console.log('usePaymentNotifications - Primeiros 3 planos:', allPlanos.slice(0, 3).map(p => ({
          id: p.id,
          type: p.type,
          active: p.active,
          analysisId: 'analysisId' in p ? p.analysisId : 'N/A',
          dueDate: p.dueDate
        })));
      }
      
      const pendingNotifications = filterTarotPlans(allPlanos);
      console.log('usePaymentNotifications - Notificações pendentes de tarot:', pendingNotifications.length);
      
      if (pendingNotifications.length > 0) {
        console.log('usePaymentNotifications - Primeiras notificações:', pendingNotifications.slice(0, 2).map(p => ({
          id: p.id,
          clientName: p.clientName,
          dueDate: p.dueDate,
          amount: p.amount,
          type: p.type
        })));
      }
      
      const grouped = groupPaymentsByClient(pendingNotifications);
      console.log('usePaymentNotifications - Grupos de pagamento criados:', grouped.length);
      
      setGroupedPayments(grouped);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('usePaymentNotifications - Erro ao verificar notificações:', error);
      setGroupedPayments([]);
    }
  }, [getPlanos]);

  const debouncedCheck = useDebounceCallback(checkTarotPaymentNotifications, 50);

  const markAsPaid = useCallback((notificationId: string) => {
    console.log('markAsPaid - Iniciando para ID:', notificationId);
    try {
      const allPlanos = getPlanos();
      const planoToUpdate = allPlanos.find(p => p.id === notificationId);
      
      if (planoToUpdate) {
        console.log('markAsPaid - Plano encontrado:', {
          id: planoToUpdate.id,
          clientName: planoToUpdate.clientName,
          currentActive: planoToUpdate.active
        });
      }
      
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

      // Disparar eventos múltiplas vezes para garantir sincronização
      triggerSyncEvents();
      setTimeout(triggerSyncEvents, 50);
      setTimeout(triggerSyncEvents, 100);
      
      // Verificar novamente após delay
      setTimeout(() => {
        debouncedCheck();
      }, 200);
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
      }, 200);
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
    console.log('usePaymentNotifications - Inicializando hook...');
    checkTarotPaymentNotifications();
    
    const handlePaymentUpdate = (event?: CustomEvent) => {
      console.log('handlePaymentUpdate - Evento de atualização recebido', event?.detail);
      setTimeout(() => {
        debouncedCheck();
      }, 50);
    };
    
    // Escuta múltiplos eventos para capturar todas as atualizações
    const eventNames = [
      'tarot-payment-updated',
      'planosUpdated',
      'paymentStatusChanged',
      'tarotAnalysesUpdated',
      'atendimentosUpdated',
      'monthlyPaymentsUpdated',
      'payment-notifications-cleared'
    ];

    eventNames.forEach(eventName => {
      window.addEventListener(eventName, handlePaymentUpdate as EventListener);
    });
    
    // Verificação periódica para garantir sincronização
    const intervalId = setInterval(() => {
      console.log('usePaymentNotifications - Verificação periódica');
      checkTarotPaymentNotifications();
    }, 30000); // A cada 30 segundos
    
    return () => {
      eventNames.forEach(eventName => {
        window.removeEventListener(eventName, handlePaymentUpdate as EventListener);
      });
      clearInterval(intervalId);
    };
  }, [checkTarotPaymentNotifications, debouncedCheck]);

  // Forçar atualização quando lastUpdate muda
  useEffect(() => {
    console.log('usePaymentNotifications - Estado atualizado:', {
      groupedPaymentsCount: groupedPayments.length,
      lastUpdate: new Date(lastUpdate).toISOString()
    });
  }, [groupedPayments, lastUpdate]);

  return {
    groupedPayments,
    markAsPaid,
    postponePayment,
    deleteNotification,
    refresh: checkTarotPaymentNotifications
  };
};
