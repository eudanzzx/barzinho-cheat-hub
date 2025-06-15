
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
    
    // Log some sample plans to debug
    const samplePlanos = allPlanos.slice(0, 3);
    console.log('usePaymentNotifications - Amostra de planos:', samplePlanos);
    
    const pendingNotifications = filterTarotPlans(allPlanos);
    console.log('usePaymentNotifications - Notificações pendentes:', pendingNotifications.length);
    console.log('usePaymentNotifications - Notificações pendentes detalhadas:', pendingNotifications);
    
    const grouped = groupPaymentsByClient(pendingNotifications);
    console.log('usePaymentNotifications - Grupos de pagamento:', grouped.length);
    console.log('usePaymentNotifications - Grupos detalhados:', grouped);
    
    setGroupedPayments(grouped);
  }, [getPlanos]);

  const markAsPaid = useCallback((notificationId: string) => {
    console.log('markAsPaid - Iniciando para ID:', notificationId);
    const allPlanos = getPlanos();
    const updatedPlanos = handleMarkAsPaid(notificationId, allPlanos, savePlanos);
    
    // Force immediate refresh with a small delay
    console.log('markAsPaid - Forçando refresh das notificações');
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 100);
  }, [getPlanos, savePlanos, checkTarotPaymentNotifications]);

  const postponePayment = useCallback((notificationId: string) => {
    console.log('postponePayment - Adiando pagamento:', notificationId);
    const allPlanos = getPlanos();
    handlePostponePayment(notificationId, allPlanos, savePlanos);
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 100);
  }, [getPlanos, savePlanos, checkTarotPaymentNotifications]);

  const deleteNotification = useCallback((notificationId: string) => {
    console.log('deleteNotification - Excluindo notificação:', notificationId);
    const allPlanos = getPlanos();
    handleDeleteNotification(notificationId, allPlanos, savePlanos);
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 100);
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
    window.addEventListener('storage', handlePaymentUpdate as EventListener);
    
    // Also check periodically
    const interval = setInterval(() => {
      console.log('usePaymentNotifications - Check periódico');
      checkTarotPaymentNotifications();
    }, 10000); // Increased interval to 10 seconds
    
    return () => {
      window.removeEventListener('tarot-payment-updated', handlePaymentUpdate as EventListener);
      window.removeEventListener('planosUpdated', handlePaymentUpdate as EventListener);
      window.removeEventListener('storage', handlePaymentUpdate as EventListener);
      clearInterval(interval);
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
