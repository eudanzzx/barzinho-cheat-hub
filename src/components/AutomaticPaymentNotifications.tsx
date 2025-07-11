
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

const AutomaticPaymentNotifications: React.FC = () => {
  const { getPlanos, getAtendimentos } = useUserDataService();
  const location = useLocation();

  useEffect(() => {
    checkUpcomingPayments();
  }, []);

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const checkUpcomingPayments = () => {
    const allPlanos = getPlanos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obter clientes existentes para validar
    const allAtendimentos = getAtendimentos();
    const existingClientNames = new Set(allAtendimentos.map(a => a.nome));

    // Filtrar planos ativos que vencem hoje, amanhã ou estão em atraso
    const upcomingPayments = allPlanos.filter(plano => {
      if (!plano.active) return false;
      
      const daysOverdue = getDaysOverdue(plano.dueDate);
      // Notificar se está em atraso (> 0), vence hoje (0) ou vence amanhã (-1)
      return daysOverdue >= -1;
    });

    // Separar entre principais e tarot, validando se os clientes ainda existem
    const mainPayments = upcomingPayments.filter(plano => 
      !plano.analysisId && existingClientNames.has(plano.clientName)
    );
    const tarotPayments = upcomingPayments.filter(plano => plano.analysisId);

    // Verificar se estamos na página principal para mostrar notificações principais
    const isMainPage = location.pathname === '/';
    const isTarotPage = location.pathname.includes('listagem-tarot') || 
                        location.pathname.includes('analise-frequencial') || 
                        location.pathname.includes('editar-analise-frequencial');

    // Notificações para pagamentos principais (só na página principal)
    if (isMainPage) {
      mainPayments.forEach(payment => {
      const isMonthly = payment.type === 'plano';
      const planInfo = isMonthly 
        ? `Mês ${(payment as PlanoMensal).month}/${(payment as PlanoMensal).totalMonths}`
        : `Semana ${(payment as PlanoSemanal).week}/${(payment as PlanoSemanal).totalWeeks}`;

      const daysOverdue = getDaysOverdue(payment.dueDate);
      
      let message = '';
      let variant = 'info';
      
      if (daysOverdue > 0) {
        message = `💳 Pagamento em atraso há ${daysOverdue} ${daysOverdue === 1 ? 'dia' : 'dias'}!`;
        variant = 'error';
      } else if (daysOverdue === 0) {
        message = `💳 Pagamento vence HOJE!`;
        variant = 'error';
      } else if (daysOverdue === -1) {
        message = `💳 Pagamento vence amanhã!`;
        variant = 'warning';
      }
      
      if (variant === 'error') {
        toast.error(message, {
          duration: 15000,
          description: `${payment.clientName} - R$ ${payment.amount.toFixed(2)} (${planInfo})`,
          action: {
            label: "Ver detalhes",
            onClick: () => {
              console.log("Abrindo detalhes do pagamento principal:", payment);
              // Disparar evento para abrir o modal de detalhes
              const event = new CustomEvent('open-payment-details-modal', {
                detail: { payment }
              });
              window.dispatchEvent(event);
            }
          }
        });
      } else if (variant === 'warning') {
        toast.warning(message, {
          duration: 10000,
          description: `${payment.clientName} - R$ ${payment.amount.toFixed(2)} (${planInfo})`,
          action: {
            label: "Ver detalhes",
            onClick: () => {
              console.log("Abrindo detalhes do pagamento principal:", payment);
              // Disparar evento para abrir o modal de detalhes
              const event = new CustomEvent('open-payment-details-modal', {
                detail: { payment }
              });
              window.dispatchEvent(event);
            }
          }
        });
      }
      });
    }

    // Notificações para pagamentos do tarot (só em páginas de tarot)
    if (isTarotPage) {
      tarotPayments.forEach(payment => {
      const isMonthly = payment.type === 'plano';
      const planInfo = isMonthly 
        ? `Mês ${(payment as PlanoMensal).month}/${(payment as PlanoMensal).totalMonths}`
        : `Semana ${(payment as PlanoSemanal).week}/${(payment as PlanoSemanal).totalWeeks}`;

      const daysOverdue = getDaysOverdue(payment.dueDate);
      
      let message = '';
      let variant = 'info';
      
      if (daysOverdue > 0) {
        message = `🔮 Pagamento do tarot em atraso há ${daysOverdue} ${daysOverdue === 1 ? 'dia' : 'dias'}!`;
        variant = 'error';
      } else if (daysOverdue === 0) {
        message = `🔮 Pagamento do tarot vence HOJE!`;
        variant = 'error';
      } else if (daysOverdue === -1) {
        message = `🔮 Pagamento do tarot vence amanhã!`;
        variant = 'warning';
      }
      
      if (variant === 'error') {
        toast.error(message, {
          duration: 15000,
          description: `${payment.clientName} - R$ ${payment.amount.toFixed(2)} (${planInfo})`,
          action: {
            label: "Ver detalhes",
            onClick: () => console.log("Pagamento tarot:", payment)
          }
        });
      } else if (variant === 'warning') {
        toast.warning(message, {
          duration: 10000,
          description: `${payment.clientName} - R$ ${payment.amount.toFixed(2)} (${planInfo})`,
          action: {
            label: "Ver detalhes",
            onClick: () => console.log("Pagamento tarot:", payment)
          }
        });
      }
      });
    }

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
