
import { useState, useEffect } from "react";
import useUserDataService from "@/services/userDataService";
import { filterTarotPlans } from "./utils/tarotPlanFilters";
import { groupPaymentsByClient, GroupedPayment } from "./utils/paymentGrouping";
import { handleMarkAsPaid, handlePostponePayment, handleDeleteNotification } from "./utils/paymentActions";

export const usePaymentNotifications = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayment[]>([]);

  const checkTarotPaymentNotifications = () => {
    console.log('usePaymentNotifications - Verificando notificações...');
    const allPlanos = getPlanos();
    console.log('usePaymentNotifications - Total de planos:', allPlanos.length);
    
    const pendingNotifications = filterTarotPlans(allPlanos);
    console.log('usePaymentNotifications - Notificações pendentes:', pendingNotifications.length);
    
    const grouped = groupPaymentsByClient(pendingNotifications);
    console.log('usePaymentNotifications - Grupos de pagamento:', grouped.length);
    
    setGroupedPayments(grouped);
  };

  const markAsPaid = (notificationId: string) => {
    console.log('markAsPaid - Iniciando para ID:', notificationId);
    const allPlanos = getPlanos();
    const updatedPlanos = handleMarkAsPaid(notificationId, allPlanos, savePlanos);
    
    // Force immediate refresh
    console.log('markAsPaid - Forçando refresh das notificações');
    checkTarotPaymentNotifications();
  };

  const postponePayment = (notificationId: string) => {
    console.log('postponePayment - Adiando pagamento:', notificationId);
    const allPlanos = getPlanos();
    handlePostponePayment(notificationId, allPlanos, savePlanos);
    checkTarotPaymentNotifications();
  };

  const deleteNotification = (notificationId: string) => {
    console.log('deleteNotification - Excluindo notificação:', notificationId);
    const allPlanos = getPlanos();
    handleDeleteNotification(notificationId, allPlanos, savePlanos);
    checkTarotPaymentNotifications();
  };

  useEffect(() => {
    console.log('usePaymentNotifications - Inicializando...');
    checkTarotPaymentNotifications();
    
    // Listen for payment updates from control components
    const handlePaymentUpdate = (event?: any) => {
      console.log('handlePaymentUpdate - Evento de atualização recebido:', event?.type);
      checkTarotPaymentNotifications();
    };
    
    // Multiple event listeners to catch all possible update scenarios
    window.addEventListener('tarot-payment-updated', handlePaymentUpdate);
    window.addEventListener('planosUpdated', handlePaymentUpdate);
    window.addEventListener('storage', handlePaymentUpdate);
    
    // Also check periodically
    const interval = setInterval(() => {
      console.log('usePaymentNotifications - Check periódico');
      checkTarotPaymentNotifications();
    }, 5000);
    
    return () => {
      window.removeEventListener('tarot-payment-updated', handlePaymentUpdate);
      window.removeEventListener('planosUpdated', handlePaymentUpdate);
      window.removeEventListener('storage', handlePaymentUpdate);
      clearInterval(interval);
    };
  }, []);

  return {
    groupedPayments,
    markAsPaid,
    postponePayment,
    deleteNotification,
    refresh: checkTarotPaymentNotifications
  };
};
