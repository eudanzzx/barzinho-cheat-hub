
import React, { useEffect } from "react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

const AutomaticPaymentNotifications: React.FC = () => {
  const { getPlanos } = useUserDataService();

  useEffect(() => {
    checkUpcomingPayments();
  }, []);

  const checkUpcomingPayments = () => {
    const allPlanos = getPlanos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Filtrar planos ativos que vencem hoje ou amanhã
    const upcomingPayments = allPlanos.filter(plano => {
      if (!plano.active) return false;
      
      const dueDate = new Date(plano.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate.getTime() === today.getTime() || dueDate.getTime() === tomorrow.getTime();
    });

    // Separar entre principais e tarot
    const mainPayments = upcomingPayments.filter(plano => !plano.analysisId);
    const tarotPayments = upcomingPayments.filter(plano => plano.analysisId);

    // Notificações para pagamentos principais
    mainPayments.forEach(payment => {
      const isMonthly = payment.type === 'plano';
      const planInfo = isMonthly 
        ? `Mês ${(payment as PlanoMensal).month}/${(payment as PlanoMensal).totalMonths}`
        : `Semana ${(payment as PlanoSemanal).week}/${(payment as PlanoSemanal).totalWeeks}`;

      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const isToday = dueDate.getTime() === today.getTime();
      
      toast.info(
        isToday ? `💳 Pagamento vence HOJE!` : `💳 Pagamento vence amanhã!`,
        {
          duration: 10000,
          description: `${payment.clientName} - R$ ${payment.amount.toFixed(2)} (${planInfo})`,
          action: {
            label: "Ver detalhes",
            onClick: () => console.log("Pagamento principal:", payment)
          }
        }
      );
    });

    // Notificações para pagamentos do tarot
    tarotPayments.forEach(payment => {
      const isMonthly = payment.type === 'plano';
      const planInfo = isMonthly 
        ? `Mês ${(payment as PlanoMensal).month}/${(payment as PlanoMensal).totalMonths}`
        : `Semana ${(payment as PlanoSemanal).week}/${(payment as PlanoSemanal).totalWeeks}`;

      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const isToday = dueDate.getTime() === today.getTime();

      toast.info(
        isToday ? `🔮 Pagamento do tarot vence HOJE!` : `🔮 Pagamento do tarot vence amanhã!`,
        {
          duration: 10000,
          description: `${payment.clientName} - R$ ${payment.amount.toFixed(2)} (${planInfo})`,
          action: {
            label: "Ver detalhes",
            onClick: () => console.log("Pagamento tarot:", payment)
          }
        }
      );
    });

    // Log para debug
    if (upcomingPayments.length > 0) {
      console.log('AutomaticPaymentNotifications - Pagamentos de amanhã:', {
        total: upcomingPayments.length,
        principais: mainPayments.length,
        tarot: tarotPayments.length
      });
    }
  };

  return null; // Componente invisível
};

export default AutomaticPaymentNotifications;
