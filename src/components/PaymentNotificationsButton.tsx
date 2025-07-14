import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, CreditCard, Check, X } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import { getNextFridays } from "@/utils/fridayCalculator";

const PaymentNotificationsButton = () => {
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [notifications, setNotifications] = useState<(PlanoMensal | PlanoSemanal)[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkPaymentNotifications();
  }, []);

  // Adicionar listener para mudanças nos atendimentos
  useEffect(() => {
    const handleAtendimentosUpdated = () => {
      console.log('PaymentNotificationsButton - Atendimentos atualizados, recarregando notificações...');
      checkPaymentNotifications();
    };

    window.addEventListener('atendimentosUpdated', handleAtendimentosUpdated);
    
    return () => {
      window.removeEventListener('atendimentosUpdated', handleAtendimentosUpdated);
    };
  }, []);

  const checkPaymentNotifications = () => {
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('PaymentNotificationsButton - Verificando notificações...');
    console.log('PaymentNotificationsButton - Total planos:', allPlanos.length);
    console.log('PaymentNotificationsButton - Total atendimentos:', atendimentos.length);

    // Criar um Set com os nomes dos clientes que ainda existem nos atendimentos (apenas atendimentos principais)
    const existingClientNames = new Set(atendimentos.map(atendimento => atendimento.nome));
    
    // Filter for monthly plans - only for existing clients and without analysisId (principal)
    const monthlyPlanos = allPlanos.filter((plano): plano is PlanoMensal => 
      plano.type === 'plano' && 
      'month' in plano && 
      'totalMonths' in plano && 
      plano.active &&
      !plano.analysisId && // Apenas planos principais
      existingClientNames.has(plano.clientName) // Apenas se o cliente ainda existe
    );

    // Filter for weekly plans - only for existing clients and without analysisId (principal)
    const weeklyPlanos = allPlanos.filter((plano): plano is PlanoSemanal => 
      plano.type === 'semanal' && 
      plano.active &&
      !plano.analysisId && // Apenas planos principais
      existingClientNames.has(plano.clientName) // Apenas se o cliente ainda existe
    );

    console.log('PaymentNotificationsButton - Planos mensais válidos:', monthlyPlanos.length);
    console.log('PaymentNotificationsButton - Planos semanais válidos:', weeklyPlanos.length);

    const pendingNotifications: (PlanoMensal | PlanoSemanal)[] = [];

    // Check monthly plans
    monthlyPlanos.forEach(plano => {
      const dueDate = new Date(plano.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate <= today) {
        pendingNotifications.push(plano);
      }
    });

    // Check weekly plans
    const nextFridays = getNextFridays(1);
    const nextFriday = nextFridays[0];
    const timeDiff = nextFriday.getTime() - today.getTime();
    const daysUntilFriday = Math.ceil(timeDiff / (1000 * 3600 * 24));

    weeklyPlanos.forEach(plano => {
      // Show notifications for today (Friday) and tomorrow (Thursday)
      if (daysUntilFriday <= 1) {
        pendingNotifications.push(plano);
      }
    });

    console.log('PaymentNotificationsButton - Notificações pendentes:', pendingNotifications.length);
    setNotifications(pendingNotifications);
  };

  const markAsPaid = (notificationId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === notificationId ? { ...plano, active: false } : plano
    );
    
    savePlanos(updatedPlanos);
    checkPaymentNotifications();
    
    toast.success("Pagamento marcado como realizado!");
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
    checkPaymentNotifications();
    
    toast.info("Pagamento adiado por 7 dias");
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
          className="relative text-slate-600 hover:text-[#1E40AF] hover:bg-[#1E40AF]/10 transition-all duration-200"
          data-notification-button
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-slate-800">Notificações de Pagamentos</h3>
          <p className="text-sm text-slate-600">{notifications.length} pendência(s)</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {notifications.map((notification) => {
                const isMonthly = notification.type === 'plano';
                const isOverdue = isMonthly && getDaysOverdue((notification as PlanoMensal).dueDate) > 0;
                
                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      isOverdue 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1">
                            {isMonthly ? (
                              <CreditCard className="h-3 w-3 text-blue-600" />
                            ) : (
                              <Calendar className="h-3 w-3 text-green-600" />
                            )}
                            <span className="font-medium text-slate-800 text-sm truncate">
                              {notification.clientName}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {isMonthly ? 'Mensal' : 'Semanal'}
                          </Badge>
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
                            <span className="text-red-600 font-medium">
                              {getDaysOverdue((notification as PlanoMensal).dueDate)} dias em atraso
                            </span>
                          )}
                          {!isMonthly && (
                            <span className="text-green-600">
                              Vencimento: Sexta-feira
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
                            className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-100"
                          >
                            <Calendar className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsPaid(notification.id)}
                          className="h-6 w-6 p-0 text-green-600 hover:bg-green-100"
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

export default PaymentNotificationsButton;
