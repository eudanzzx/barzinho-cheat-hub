import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, CreditCard, Check, Sparkles, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

interface GroupedPayment {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  totalPayments: number;
}

const TarotPaymentNotificationsButton = () => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayment[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkTarotPaymentNotifications();
  }, []);

  const checkTarotPaymentNotifications = () => {
    const allPlanos = getPlanos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter for tarot plans - only active ones
    const tarotPlanos = allPlanos.filter((plano) => 
      plano.active === true && 
      !!plano.analysisId
    );

    const pendingNotifications: (PlanoMensal | PlanoSemanal)[] = [];

    // Check monthly plans
    const tarotMonthlyPlanos = tarotPlanos.filter((plano): plano is PlanoMensal => 
      plano.type === 'plano' && 'month' in plano && 'totalMonths' in plano
    );

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

    // Check weekly plans
    const tarotWeeklyPlanos = tarotPlanos.filter((plano): plano is PlanoSemanal => 
      plano.type === 'semanal'
    );

    const todayDay = today.getDay();
    
    tarotWeeklyPlanos.forEach(plano => {
      const notificationTiming = plano.notificationTiming || 'on_due_date';
      
      if (notificationTiming === 'on_due_date') {
        if (todayDay === 5 || todayDay === 6 || todayDay === 0) {
          pendingNotifications.push(plano);
        }
      } else if (notificationTiming === 'next_week') {
        const dueDate = new Date(plano.dueDate);
        const nextWeekDate = new Date(dueDate);
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
        
        if (nextWeekDate.getTime() <= today.getTime()) {
          pendingNotifications.push(plano);
        }
      }
    });

    // Group payments by client
    const grouped = groupPaymentsByClient(pendingNotifications);
    setGroupedPayments(grouped);
  };

  const groupPaymentsByClient = (payments: (PlanoMensal | PlanoSemanal)[]): GroupedPayment[] => {
    const clientGroups = new Map<string, (PlanoMensal | PlanoSemanal)[]>();
    
    payments.forEach(payment => {
      const existing = clientGroups.get(payment.clientName) || [];
      existing.push(payment);
      clientGroups.set(payment.clientName, existing);
    });

    const groupedPayments: GroupedPayment[] = [];
    
    clientGroups.forEach((clientPayments, clientName) => {
      const sortedPayments = clientPayments.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

      const mostUrgent = sortedPayments[0];
      const additionalPayments = sortedPayments.slice(1);

      groupedPayments.push({
        clientName,
        mostUrgent,
        additionalPayments,
        totalPayments: sortedPayments.length
      });
    });

    return groupedPayments.sort((a, b) => 
      new Date(a.mostUrgent.dueDate).getTime() - new Date(b.mostUrgent.dueDate).getTime()
    );
  };

  const markAsPaid = (notificationId: string) => {
    const allPlanos = getPlanos();
    const currentPlano = allPlanos.find(plano => plano.id === notificationId);
    
    if (!currentPlano) {
      toast.error("Plano não encontrado!");
      return;
    }

    // Mark current payment as paid (inactive)
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === notificationId ? { ...plano, active: false } : plano
    );

    // For monthly plans, create next month's payment if not the last month
    if (currentPlano.type === 'plano' && 'month' in currentPlano && 'totalMonths' in currentPlano) {
      const currentMonth = currentPlano.month;
      const totalMonths = currentPlano.totalMonths;
      
      if (currentMonth < totalMonths) {
        // Create next month's payment
        const nextDueDate = new Date(currentPlano.dueDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        
        const nextPlano: PlanoMensal = {
          id: `${currentPlano.analysisId}-month-${currentMonth + 1}`,
          clientName: currentPlano.clientName,
          type: 'plano',
          amount: currentPlano.amount,
          dueDate: nextDueDate.toISOString().split('T')[0],
          month: currentMonth + 1,
          totalMonths: totalMonths,
          created: new Date().toISOString(),
          active: true,
          notificationTiming: currentPlano.notificationTiming || 'on_due_date',
          analysisId: currentPlano.analysisId
        };
        
        updatedPlanos.push(nextPlano);
        toast.success(`Pagamento marcado como pago! Próximo vencimento: ${nextDueDate.toLocaleDateString('pt-BR')}`);
      } else {
        toast.success("Último pagamento do plano marcado como pago!");
      }
    } 
    // For weekly plans, create next week's payment
    else if (currentPlano.type === 'semanal') {
      const currentWeek = currentPlano.week || 1;
      const totalWeeks = currentPlano.totalWeeks || 1;
      
      if (currentWeek < totalWeeks) {
        // Create next week's payment
        const nextDueDate = new Date(currentPlano.dueDate);
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        
        const nextPlano: PlanoSemanal = {
          id: `${currentPlano.analysisId}-week-${currentWeek + 1}`,
          clientName: currentPlano.clientName,
          type: 'semanal',
          amount: currentPlano.amount,
          dueDate: nextDueDate.toISOString().split('T')[0],
          week: currentWeek + 1,
          totalWeeks: totalWeeks,
          created: new Date().toISOString(),
          active: true,
          notificationTiming: currentPlano.notificationTiming || 'on_due_date',
          analysisId: currentPlano.analysisId
        };
        
        updatedPlanos.push(nextPlano);
        toast.success(`Pagamento semanal marcado como pago! Próxima semana: ${nextDueDate.toLocaleDateString('pt-BR')}`);
      } else {
        toast.success("Último pagamento semanal marcado como pago!");
      }
    }
    
    savePlanos(updatedPlanos);
    checkTarotPaymentNotifications();
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
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyLevel = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue === 0) return 'today';
    if (daysUntilDue <= 1) return 'urgent';
    if (daysUntilDue <= 3) return 'warning';
    return 'normal';
  };

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'today': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'urgent': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-purple-600 bg-purple-50 border-purple-200';
    }
  };

  const getUrgencyText = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} ${Math.abs(daysUntilDue) === 1 ? 'dia' : 'dias'} em atraso`;
    if (daysUntilDue === 0) return 'Vence hoje';
    if (daysUntilDue === 1) return 'Vence amanha';
    return `${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'} restantes`;
  };

  const PaymentCard = ({ payment, isAdditional = false }: { payment: PlanoMensal | PlanoSemanal; isAdditional?: boolean }) => {
    const daysUntilDue = getDaysUntilDue(payment.dueDate);
    const urgencyLevel = getUrgencyLevel(daysUntilDue);
    const urgencyColor = getUrgencyColor(urgencyLevel);
    const formattedDate = formatDate(payment.dueDate);
    
    return (
      <div className={`p-3 rounded-lg border transition-all duration-200 ${urgencyColor} ${isAdditional ? 'ml-4 mt-2' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {payment.type === 'plano' ? (
              <CreditCard className="h-4 w-4" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            <Badge 
              variant="outline" 
              className={`${urgencyColor} font-medium text-xs`}
            >
              {payment.type === 'plano' ? 'Mensal' : 'Semanal'}
            </Badge>
          </div>
          <span className="text-lg font-bold text-green-600">
            R$ {payment.amount.toFixed(2)}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">
                {formattedDate.date} as {formattedDate.time}
              </span>
            </div>
          </div>
          <div className="text-sm font-medium">
            {getUrgencyText(daysUntilDue)}
          </div>
        </div>
      </div>
    );
  };

  const ClientPaymentGroup = ({ group }: { group: GroupedPayment }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasAdditionalPayments = group.additionalPayments.length > 0;

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {group.clientName}
              </span>
              {hasAdditionalPayments && (
                <Badge variant="secondary" className="text-xs">
                  +{group.additionalPayments.length} vencimento{group.additionalPayments.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex gap-1 ml-2">
              {group.mostUrgent.type === 'plano' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => postponePayment(group.mostUrgent.id)}
                  className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-100"
                  title="Adiar pagamento"
                >
                  <Calendar className="h-3 w-3" />
                </Button>
              )}
              {group.mostUrgent.type === 'semanal' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteNotification(group.mostUrgent.id)}
                  className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                  title="Excluir notificacao"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markAsPaid(group.mostUrgent.id)}
                className="h-6 w-6 p-0 text-green-600 hover:bg-green-100"
                title="Marcar como pago"
              >
                <Check className="h-3 w-3" />
              </Button>
              {hasAdditionalPayments && (
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </div>
          
          <PaymentCard payment={group.mostUrgent} />
          
          {hasAdditionalPayments && (
            <CollapsibleContent className="space-y-2">
              {group.additionalPayments.map((payment) => (
                <PaymentCard 
                  key={payment.id} 
                  payment={payment} 
                  isAdditional={true}
                />
              ))}
            </CollapsibleContent>
          )}
        </div>
      </Collapsible>
    );
  };

  const totalPayments = groupedPayments.reduce((acc, group) => acc + group.totalPayments, 0);

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
          {totalPayments > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-purple-500 text-white text-xs">
              {totalPayments}
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
          <p className="text-sm text-slate-600">{groupedPayments.length} cliente(s) com {totalPayments} pendencia(s)</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {groupedPayments.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 opacity-30" />
                <Bell className="h-6 w-6 opacity-30" />
              </div>
              <p>Nenhuma notificacao ativa do tarot</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {groupedPayments.map((group) => (
                <ClientPaymentGroup 
                  key={group.clientName}
                  group={group}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TarotPaymentNotificationsButton;
