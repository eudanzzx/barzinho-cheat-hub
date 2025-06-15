
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
    
    // Refresh immediately
    console.log('markAsPaid - Forçando refresh das notificações');
    checkTarotPaymentNotifications();
    
    // Also trigger events for other components to update
    window.dispatchEvent(new CustomEvent('tarot-payment-updated', { 
      detail: { updated: true, action: 'markAsPaid', id: notificationId, timestamp: Date.now() } 
    }));
    window.dispatchEvent(new CustomEvent('planosUpdated', { 
      detail: { updated: true, action: 'markAsPaid', id: notificationId, timestamp: Date.now() } 
    }));
  }, [getPlanos, savePlanos, checkTarotPaymentNotifications]);

  const postponePayment = useCallback((notificationId: string) => {
    console.log('postponePayment - Adiando pagamento:', notificationId);
    const allPlanos = getPlanos();
    handlePostponePayment(notificationId, allPlanos, savePlanos);
    checkTarotPaymentNotifications();
    
    window.dispatchEvent(new CustomEvent('tarot-payment-updated', { 
      detail: { updated: true, action: 'postpone', id: notificationId, timestamp: Date.now() } 
    }));
  }, [getPlanos, savePlanos, checkTarotPaymentNotifications]);

  const deleteNotification = useCallback((notificationId: string) => {
    console.log('deleteNotification - Excluindo notificação:', notificationId);
    const allPlanos = getPlanos();
    handleDeleteNotification(notificationId, allPlanos, savePlanos);
    checkTarotPaymentNotifications();
    
    window.dispatchEvent(new CustomEvent('tarot-payment-updated', { 
      detail: { updated: true, action: 'delete', id: notificationId, timestamp: Date.now() } 
    }));
  }, [getPlanos, savePlanos, checkTarotPaymentNotifications]);

  useEffect(() => {
    console.log('usePaymentNotifications - Inicializando...');
    checkTarotPaymentNotifications();
    
    // Listen for payment updates from control components
    const handlePaymentUpdate = (event?: CustomEvent) => {
      console.log('handlePaymentUpdate - Evento de atualização recebido', event?.detail);
      checkTarotPaymentNotifications();
    };
    
    // Multiple event listeners to catch all possible update scenarios
    window.addEventListener('tarot-payment-updated', handlePaymentUpdate as EventListener);
    window.addEventListener('planosUpdated', handlePaymentUpdate as EventListener);
    
    return () => {
      window.removeEventListener('tarot-payment-updated', handlePaymentUpdate as EventListener);
      window.removeEventListener('planosUpdated', handlePaymentUpdate as EventListener);
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
