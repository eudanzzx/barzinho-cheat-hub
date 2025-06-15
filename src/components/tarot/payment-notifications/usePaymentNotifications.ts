
import { useState, useEffect } from "react";
import useUserDataService from "@/services/userDataService";
import { filterTarotPlans } from "./utils/tarotPlanFilters";
import { groupPaymentsByClient, GroupedPayment } from "./utils/paymentGrouping";
import { handleMarkAsPaid, handlePostponePayment, handleDeleteNotification } from "./utils/paymentActions";

export const usePaymentNotifications = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayment[]>([]);

  const checkTarotPaymentNotifications = () => {
    console.log('checkTarotPaymentNotifications - Verificando notificações...');
    const allPlanos = getPlanos();
    console.log('checkTarotPaymentNotifications - Total de planos:', allPlanos.length);
    
    const pendingNotifications = filterTarotPlans(allPlanos);
    console.log('checkTarotPaymentNotifications - Notificações pendentes:', pendingNotifications.length);
    
    const grouped = groupPaymentsByClient(pendingNotifications);
    console.log('checkTarotPaymentNotifications - Grupos de pagamento:', grouped.length);
    
    setGroupedPayments(grouped);
  };

  const markAsPaid = (notificationId: string) => {
    console.log('markAsPaid - Iniciando para ID:', notificationId);
    const allPlanos = getPlanos();
    handleMarkAsPaid(notificationId, allPlanos, savePlanos);
    
    // Force immediate refresh
    setTimeout(() => {
      console.log('markAsPaid - Atualizando notificações após pagamento');
      checkTarotPaymentNotifications();
    }, 100);
  };

  const postponePayment = (notificationId: string) => {
    const allPlanos = getPlanos();
    handlePostponePayment(notificationId, allPlanos, savePlanos);
    
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 100);
  };

  const deleteNotification = (notificationId: string) => {
    const allPlanos = getPlanos();
    handleDeleteNotification(notificationId, allPlanos, savePlanos);
    
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 100);
  };

  useEffect(() => {
    checkTarotPaymentNotifications();
    
    // Listen for payment updates from control components
    const handlePaymentUpdate = () => {
      console.log('handlePaymentUpdate - Evento de atualização recebido');
      setTimeout(() => {
        checkTarotPaymentNotifications();
      }, 200);
    };
    
    window.addEventListener('tarot-payment-updated', handlePaymentUpdate);
    window.addEventListener('planosUpdated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('tarot-payment-updated', handlePaymentUpdate);
      window.removeEventListener('planosUpdated', handlePaymentUpdate);
    };
  }, []);

  return {
    groupedPayments,
    markAsPaid,
    postponePayment,
    deleteNotification
  };
};
