
import { useState, useEffect } from "react";
import useUserDataService from "@/services/userDataService";
import { filterTarotPlans } from "./utils/tarotPlanFilters";
import { groupPaymentsByClient, GroupedPayment } from "./utils/paymentGrouping";
import { handleMarkAsPaid, handlePostponePayment, handleDeleteNotification } from "./utils/paymentActions";

export const usePaymentNotifications = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayment[]>([]);

  const checkTarotPaymentNotifications = () => {
    const allPlanos = getPlanos();
    const pendingNotifications = filterTarotPlans(allPlanos);
    const grouped = groupPaymentsByClient(pendingNotifications);
    setGroupedPayments(grouped);
  };

  const markAsPaid = (notificationId: string) => {
    const allPlanos = getPlanos();
    handleMarkAsPaid(notificationId, allPlanos, savePlanos);
    
    // Force immediate refresh
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 50);
  };

  const postponePayment = (notificationId: string) => {
    const allPlanos = getPlanos();
    handlePostponePayment(notificationId, allPlanos, savePlanos);
    
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 50);
  };

  const deleteNotification = (notificationId: string) => {
    const allPlanos = getPlanos();
    handleDeleteNotification(notificationId, allPlanos, savePlanos);
    
    setTimeout(() => {
      checkTarotPaymentNotifications();
    }, 50);
  };

  useEffect(() => {
    checkTarotPaymentNotifications();
    
    // Listen for payment updates from control components
    const handlePaymentUpdate = () => {
      setTimeout(() => {
        checkTarotPaymentNotifications();
      }, 100);
    };
    
    // Listen for tarot payment updates
    const handleTarotPaymentUpdate = () => {
      setTimeout(() => {
        checkTarotPaymentNotifications();
      }, 100);
    };
    
    window.addEventListener('tarot-payment-updated', handlePaymentUpdate);
    window.addEventListener('tarot-payment-updated', handleTarotPaymentUpdate);
    window.addEventListener('planosUpdated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('tarot-payment-updated', handlePaymentUpdate);
      window.removeEventListener('tarot-payment-updated', handleTarotPaymentUpdate);
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
