import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Bell, BellOff, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePaymentNotifications } from "@/components/tarot/payment-notifications/usePaymentNotifications";
import { useIsMobile } from "@/hooks/use-mobile";

const TarotNotificationButton = () => {
  const { groupedPayments, markAsPaid, deleteNotification } = usePaymentNotifications();
  const [isNotificationSilenced, setIsNotificationSilenced] = useState(false);
  const isMobile = useIsMobile();

  // Filtrar apenas notificações vencidas
  const overduePayments = groupedPayments.flatMap(group => {
    const allPayments = [group.mostUrgent, ...group.additionalPayments];
    return allPayments.filter(payment => {
      const today = new Date();
      const dueDate = new Date(payment.dueDate);
      return dueDate < today;
    });
  });

  const totalOverdueCount = overduePayments.length;

  useEffect(() => {
    const silencedState = localStorage.getItem('tarot-notifications-silenced');
    setIsNotificationSilenced(silencedState === 'true');
  }, []);

  const toggleNotificationSilence = () => {
    const newState = !isNotificationSilenced;
    setIsNotificationSilenced(newState);
    localStorage.setItem('tarot-notifications-silenced', newState.toString());
  };

  const handleViewDetails = (payment: any) => {
    const event = new CustomEvent('open-payment-details-modal', {
      detail: { payment }
    });
    window.dispatchEvent(event);
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "default"}
          className="relative flex items-center gap-1 text-purple-700 bg-purple-100 hover:bg-purple-200 px-2 py-1 sm:px-3 sm:py-2 rounded-xl font-medium shadow border border-purple-200"
        >
          {isNotificationSilenced ? (
            <BellOff className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          ) : (
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          )}
          {!isMobile && <span className="text-xs sm:text-sm">Notificações</span>}
          {totalOverdueCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalOverdueCount > 99 ? '99+' : totalOverdueCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto bg-white border shadow-lg z-[60]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações Tarot</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleNotificationSilence}
            className="h-6 px-2"
          >
            {isNotificationSilenced ? (
              <BellOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Bell className="h-4 w-4 text-purple-600" />
            )}
          </Button>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {totalOverdueCount === 0 ? (
          <DropdownMenuItem disabled>
            <span className="text-gray-500">Nenhuma notificação vencida</span>
          </DropdownMenuItem>
        ) : (
          overduePayments.map((payment) => {
            const daysOverdue = getDaysOverdue(payment.dueDate);
            const isMonthly = payment.type === 'plano';
            const planInfo = isMonthly 
              ? `Mês ${payment.month}/${payment.totalMonths}`
              : `Semana ${payment.week}/${payment.totalWeeks}`;

            return (
              <DropdownMenuItem key={payment.id} className="flex-col items-start p-3 space-y-2">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{payment.clientName}</span>
                    <Badge variant="destructive" className="text-xs">
                      {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atraso
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    R$ {payment.amount.toFixed(2)} - {planInfo}
                  </div>
                  <div className="text-xs text-gray-500">
                    Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(payment);
                    }}
                    className="flex-1 text-xs h-7"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TarotNotificationButton;