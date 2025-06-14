import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, CreditCard, Check, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import { getNextFridays } from "@/utils/fridayCalculator";

const TarotPaymentNotificationsButton = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [notifications, setNotifications] = useState<(PlanoMensal | PlanoSemanal)[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkTarotPaymentNotifications();
  }, []);

  const checkTarotPaymentNotifications = () => {
    const allPlanos = getPlanos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter for tarot monthly plans - only active ones
    const tarotMonthlyPlanos = allPlanos.filter((plano): plano is PlanoMensal => 
      plano.type === 'plano' && 
      'month' in plano && 
      'totalMonths' in plano && 
      plano.active === true && 
      !!plano.analysisId
    );

    // Filter for tarot weekly plans - only active ones
    const tarotWeeklyPlanos = allPlanos.filter((plano): plano is PlanoSemanal => 
      plano.type === 'semanal' && 
      plano.active === true && 
      !!plano.analysisId
    );

    const pendingNotifications: (PlanoMensal | PlanoSemanal)[] = [];

    // Check monthly plans - respect notification timing
    tarotMonthlyPlanos.forEach(plano => {
      const dueDate = new Date(plano.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const notificationTiming = plano.notificationTiming || 'on_due_date';
      
      if (notificationTiming === 'on_due_date') {
        if (dueDate.getTime() <= today.getTime()) {
          pendingNotifications.push(plano);
        }
      } else if (notificationTiming === 'next_week') {
        const nextWeekDate = new Date(dueDate);
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
        nextWeekDate.setHours(0, 0, 0, 0);
        
        if (nextWeekDate.getTime() <= today.getTime()) {
          pendingNotifications.push(plano);
        }
      }
    });

    // Check weekly plans - respect notification timing
    const todayDay = today.getDay(); // 0 = Sunday, 5 = Friday
    
    tarotWeeklyPlanos.forEach(plano => {
      const notificationTiming = plano.notificationTiming || 'on_due_date';
      
      if (notificationTiming === 'on_due_date') {
        // Show weekly notifications on Friday (5) or if it's past Friday in the current week
        if (todayDay === 5 || todayDay === 6 || todayDay === 0) {
          pendingNotifications.push(plano);
        }
      } else if (notificationTiming === 'next_week') {
        // Only show if it's the following week
        const dueDate = new Date(plano.dueDate);
        const nextWeekDate = new Date(dueDate);
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
        
        if (nextWeekDate.getTime() <= today.getTime()) {
          pendingNotifications.push(plano);
        }
      }
    });

    setNotifications(pendingNotifications);
  };

  const markAsPaid = (notificationId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === notificationId ? { ...plano, active: false } : plano
    );
    
    savePlanos(updatedPlanos);
    checkTarotPaymentNotifications();
    
    toast.success("Pagamento do tarot marcado como realizado!");
  };

  const postponePayment = (notificationId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => {
      if (plano.id === notificationId) {
        if (plano.type === 'plano') {
          const newDueDate = new Date(plano.dueDate);
          newDueDate.setDate(newDueDate.getDate() + 7);
          return { ...plano, dueDate: newDueDate.toISOString().split('T')[0] };
        }
      }
      return plano;
    });
    
    savePlanos(updatedPlanos);
    checkTarotPaymentNotifications();
    
    toast.info("Pagamento do tarot adiado por 7 dias");
  };

  const deleteNotification = (notificationId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.filter(plano => plano.id !== notificationId);
    
    savePlanos(updatedPlanos);
    checkTarotPaymentNotifications();
    
    toast.success("Notificação de pagamento excluída!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-slate-600 hover:text-[#6B21A8] hover:bg-[#6B21A8]/10 transition-all duration-200"
          data-notification-button
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-purple-500 text-white text-xs">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#6B21A8]" />
            <h3 className="font-semibold text-slate-800">Pagamentos do Tarot</h3>
          </div>
          <p className="text-sm text-slate-600">{notifications.length} pendência(s) ativa(s)</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 opacity-30" />
                <Bell className="h-6 w-6 opacity-30" />
              </div>
              <p>Nenhuma notificação ativa do tarot</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {notifications.map((notification) => {
                const isMonthly = notification.type === 'plano';
                const isWeekly = notification.type === 'semanal';
                const isOverdue = isMonthly && getDaysOverdue((notification as PlanoMensal).dueDate) > 0;
                
                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      isOverdue 
                        ? 'border-purple-300 bg-purple-100' 
                        : 'border-purple-200 bg-purple-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-[#6B21A8]" />
                            {isMonthly ? (
                              <CreditCard className="h-3 w-3 text-purple-600" />
                            ) : (
                              <Calendar className="h-3 w-3 text-purple-600" />
                            )}
                            <span className="font-medium text-slate-800 text-sm truncate">
                              {notification.clientName}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                            {isMonthly ? 'Mensal' : 'Semanal'}
                          </Badge>
                          {isWeekly && (
                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                              Urgente
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>R$ {notification.amount.toFixed(2)}</span>
                            {isMonthly && (
                              <span>
                                Venc: {formatDate((notification as PlanoMensal).dueDate)}
                              </span>
                            )}
                          </div>
                          {isOverdue && (
                            <span className="text-purple-700 font-medium">
                              {getDaysOverdue((notification as PlanoMensal).dueDate)} dias em atraso
                            </span>
                          )}
                          {isWeekly && (
                            <span className="text-orange-600 font-medium">
                              Pagamento Semanal - Vencimento: Sexta-feira
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        {isMonthly && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => postponePayment(notification.id)}
                            className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-100"
                            title="Adiar pagamento"
                          >
                            <Calendar className="h-3 w-3" />
                          </Button>
                        )}
                        {isWeekly && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                            title="Excluir notificação"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsPaid(notification.id)}
                          className="h-6 w-6 p-0 text-green-600 hover:bg-green-100"
                          title="Marcar como pago"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TarotPaymentNotificationsButton;
