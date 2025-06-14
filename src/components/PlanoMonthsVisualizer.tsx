import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Check, X, Bell, BellOff, Trash2, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";
import PaymentNotificationsButton from "@/components/PaymentNotificationsButton";
import { cn } from "@/lib/utils";

interface PlanoMonthsVisualizerProps {
  atendimento: {
    id: string;
    nome: string;
    planoAtivo?: boolean;
    planoData?: {
      meses: string;
      valorMensal: string;
      diaVencimento?: string;
    } | null;
    dataAtendimento: string;
    data?: string;
  };
}

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  planoId?: string;
  notificationEnabled?: boolean;
}

const PlanoMonthsVisualizer: React.FC<PlanoMonthsVisualizerProps> = ({ atendimento }) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [planoMonths, setPlanoMonths] = useState<PlanoMonth[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  console.log('PlanoMonthsVisualizer - atendimento:', atendimento);
  console.log('PlanoMonthsVisualizer - planoAtivo:', atendimento.planoAtivo);
  console.log('PlanoMonthsVisualizer - planoData:', atendimento.planoData);

  useEffect(() => {
    if (atendimento.planoAtivo && atendimento.planoData) {
      console.log('PlanoMonthsVisualizer - Initializing plano months');
      initializePlanoMonths();
    }
  }, [atendimento]);

  const initializePlanoMonths = () => {
    if (!atendimento.planoData) {
      console.log('PlanoMonthsVisualizer - Missing planoData');
      return;
    }

    let startDateString = atendimento.dataAtendimento;
    if (!startDateString || startDateString.trim() === '') {
      startDateString = atendimento.data || new Date().toISOString();
      console.log('PlanoMonthsVisualizer - Using fallback date:', startDateString);
    }

    const startDate = new Date(startDateString);
    if (isNaN(startDate.getTime())) {
      console.error('Invalid date provided:', startDateString);
      toast.error('Data de atendimento inválida');
      return;
    }

    const totalMonths = parseInt(atendimento.planoData.meses);
    if (isNaN(totalMonths) || totalMonths <= 0) {
      console.error('Invalid number of months:', atendimento.planoData.meses);
      toast.error('Número de meses inválido');
      return;
    }

    // For monthly plans, use the configured day
    let dueDay = 5; // Default day
    if (atendimento.planoData.diaVencimento) {
      const parsedDay = parseInt(atendimento.planoData.diaVencimento);
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        dueDay = parsedDay;
      }
    }
    
    console.log('PlanoMonthsVisualizer - Dia de vencimento configurado:', dueDay);
    console.log('PlanoMonthsVisualizer - Creating months for:', totalMonths, 'starting from:', startDate);

    const planos = getPlanos();
    const months: PlanoMonth[] = [];
    
    for (let i = 1; i <= totalMonths; i++) {
      // Create the due date for this month
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      // Set the configured day of month, handling edge cases
      const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
      const actualDueDay = Math.min(dueDay, lastDayOfMonth);
      dueDate.setDate(actualDueDay);
      
      // Validate the date before using it
      if (isNaN(dueDate.getTime())) {
        console.error('Invalid due date created for month', i);
        continue;
      }
      
      // Filter for monthly plans only
      const planoForMonth = planos.find((plano): plano is PlanoMensal => 
        plano.clientName === atendimento.nome && 
        plano.type === 'plano' &&
        'month' in plano &&
        plano.month === i && 
        plano.totalMonths === totalMonths
      );
      
      months.push({
        month: i,
        isPaid: planoForMonth ? !planoForMonth.active : false,
        dueDate: dueDate.toISOString().split('T')[0],
        planoId: planoForMonth?.id,
        notificationEnabled: planoForMonth ? planoForMonth.active : false
      });
    }
    
    console.log('PlanoMonthsVisualizer - Created months:', months);
    setPlanoMonths(months);
  };

  const handlePaymentToggle = (monthIndex: number) => {
    const month = planoMonths[monthIndex];
    const planos = getPlanos();
    
    const newIsPaid = !month.isPaid;
    
    if (month.planoId) {
      // Update existing plano record
      const updatedPlanos = planos.map(plano => 
        plano.id === month.planoId 
          ? { ...plano, active: !newIsPaid }
          : plano
      );
      savePlanos(updatedPlanos);
      
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = newIsPaid;
      setPlanoMonths(updatedMonths);
    } else if (newIsPaid) {
      const newPlano: PlanoMensal = {
        id: `${Date.now()}-${monthIndex}`,
        clientName: atendimento.nome,
        type: 'plano',
        amount: parseFloat(atendimento.planoData?.valorMensal || '0'),
        dueDate: month.dueDate,
        month: month.month,
        totalMonths: parseInt(atendimento.planoData?.meses || '0'),
        created: new Date().toISOString(),
        active: false,
        notificationTiming: 'on_due_date'
      };
      
      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);
      
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      updatedMonths[monthIndex].isPaid = true;
      setPlanoMonths(updatedMonths);
    } else {
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = false;
      setPlanoMonths(updatedMonths);
    }
    
    toast.success(
      newIsPaid 
        ? `Mês ${month.month} marcado como pago` 
        : `Mês ${month.month} marcado como pendente`
    );
  };

  const handleNotificationToggle = (monthIndex: number) => {
    const month = planoMonths[monthIndex];
    const planos = getPlanos();
    
    const newNotificationEnabled = !month.notificationEnabled;
    
    if (month.planoId) {
      // Update existing plano record
      const updatedPlanos = planos.map(plano => 
        plano.id === month.planoId 
          ? { ...plano, active: newNotificationEnabled }
          : plano
      );
      savePlanos(updatedPlanos);
    } else {
      // Create new plano record for notification
      const newPlano: PlanoMensal = {
        id: `${Date.now()}-${monthIndex}`,
        clientName: atendimento.nome,
        type: 'plano',
        amount: parseFloat(atendimento.planoData?.valorMensal || '0'),
        dueDate: month.dueDate,
        month: month.month,
        totalMonths: parseInt(atendimento.planoData?.meses || '0'),
        created: new Date().toISOString(),
        active: newNotificationEnabled,
        notificationTiming: 'on_due_date'
      };
      
      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);
      
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      setPlanoMonths(updatedMonths);
    }
    
    const updatedMonths = [...planoMonths];
    updatedMonths[monthIndex].notificationEnabled = newNotificationEnabled;
    setPlanoMonths(updatedMonths);
    
    toast.success(
      newNotificationEnabled 
        ? `Notificação ativada para o mês ${month.month}` 
        : `Notificação desativada para o mês ${month.month}`
    );
  };

  const handleDeleteAllNotifications = () => {
    const planos = getPlanos();
    
    // Remove todas as notificações relacionadas a este plano mensal
    const updatedPlanos = planos.filter(plano => {
      const isRelated = plano.clientName === atendimento.nome && 
                       plano.type === 'plano' &&
                       'totalMonths' in plano &&
                       plano.totalMonths === parseInt(atendimento.planoData?.meses || '0');
      return !isRelated;
    });
    
    savePlanos(updatedPlanos);
    
    // Resetar o estado local
    const resetMonths = planoMonths.map(month => ({
      ...month,
      isPaid: false,
      planoId: undefined,
      notificationEnabled: false
    }));
    
    setPlanoMonths(resetMonths);
    
    toast.success('Todas as notificações mensais foram removidas');
  };

  const handleToggleAllNotifications = () => {
    const planos = getPlanos();
    const hasAnyNotificationEnabled = planoMonths.some(month => month.notificationEnabled);
    const newNotificationState = !hasAnyNotificationEnabled;
    
    let updatedPlanos = [...planos];
    
    const updatedMonths = planoMonths.map((month, index) => {
      if (month.planoId) {
        // Update existing record
        updatedPlanos = updatedPlanos.map(plano => 
          plano.id === month.planoId 
            ? { ...plano, active: newNotificationState }
            : plano
        );
      } else if (newNotificationState) {
        // Create new record if enabling notifications
        const newPlano: PlanoMensal = {
          id: `${Date.now()}-${index}`,
          clientName: atendimento.nome,
          type: 'plano',
          amount: parseFloat(atendimento.planoData?.valorMensal || '0'),
          dueDate: month.dueDate,
          month: month.month,
          totalMonths: parseInt(atendimento.planoData?.meses || '0'),
          created: new Date().toISOString(),
          active: newNotificationState,
          notificationTiming: 'on_due_date'
        };
        
        updatedPlanos = [...updatedPlanos, newPlano];
        
        return { ...month, planoId: newPlano.id, notificationEnabled: newNotificationState };
      }
      
      return { ...month, notificationEnabled: newNotificationState };
    });
    
    savePlanos(updatedPlanos);
    setPlanoMonths(updatedMonths);
    
    toast.success(
      newNotificationState 
        ? 'Todas as notificações mensais foram ativadas' 
        : 'Todas as notificações mensais foram desativadas'
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  console.log('PlanoMonthsVisualizer - Rendering with planoMonths:', planoMonths);

  if (!atendimento.planoAtivo || !atendimento.planoData) {
    console.log('PlanoMonthsVisualizer - Not rendering - planoAtivo or planoData is false/null');
    return null;
  }

  const paidCount = planoMonths.filter(m => m.isPaid).length;
  const notificationCount = planoMonths.filter(m => m.notificationEnabled).length;

  return (
    <div className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-colors duration-200 flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Pagamentos Mensais ({paidCount}/{planoMonths.length})
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-4 border-[#0EA5E9]/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#0EA5E9]/5 to-[#0EA5E9]/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-[#0EA5E9]">
                    <CreditCard className="h-5 w-5" />
                    Controle de Pagamentos do Plano
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>Total: {atendimento.planoData.meses} meses</span>
                    <span>Valor mensal: R$ {parseFloat(atendimento.planoData.valorMensal).toFixed(2)}</span>
                    {atendimento.planoData.diaVencimento && !isNaN(parseInt(atendimento.planoData.diaVencimento)) && (
                      <span>Vencimento: dia {atendimento.planoData.diaVencimento}</span>
                    )}
                    <span className="font-medium text-blue-600">
                      {notificationCount} notificações ativas
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 p-1">
                    <PaymentNotificationsButton />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleAllNotifications}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {planoMonths.some(m => m.notificationEnabled) ? 'Desativar Todas' : 'Ativar Todas'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAllNotifications}
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Apagar Notificações
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {planoMonths.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-48 mx-auto mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-32 mx-auto"></div>
                  </div>
                  <p className="mt-4">Carregando meses do plano...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    {planoMonths.map((month, index) => (
                      <div key={month.month} className="flex items-center gap-4">
                        <Button
                          onClick={() => handlePaymentToggle(index)}
                          variant="outline"
                          className={`
                            relative h-auto flex-1 p-4 flex items-center gap-4
                            transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group
                            border-2 rounded-xl overflow-hidden
                            ${month.isPaid 
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-400 shadow-emerald-200/50' 
                              : 'bg-gradient-to-r from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 border-slate-300 text-slate-700 shadow-slate-200/50 hover:border-[#0EA5E9]/50'
                            }
                          `}
                        >
                          <div className={`
                            p-2 rounded-full transition-all duration-300
                            ${month.isPaid 
                              ? 'bg-white/20 text-white' 
                              : 'bg-slate-200 text-slate-500 group-hover:bg-[#0EA5E9]/20 group-hover:text-[#0EA5E9]'
                            }
                          `}>
                            {month.isPaid ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <X className="h-5 w-5" />
                            )}
                          </div>
                          
                          <div className="flex-1 text-left">
                            <div className={`
                              text-lg font-bold mb-1 transition-colors duration-300
                              ${month.isPaid ? 'text-white' : 'text-slate-700 group-hover:text-[#0EA5E9]'}
                            `}>
                              {month.month}º Mês
                            </div>
                            <div className={`
                              text-sm transition-colors duration-300
                              ${month.isPaid ? 'text-white/80' : 'text-slate-500'}
                            `}>
                              Vencimento: {formatDate(month.dueDate)}
                            </div>
                          </div>
                          
                          <Badge 
                            variant="outline"
                            className={`
                              text-sm font-medium border transition-all duration-300
                              ${month.isPaid 
                                ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
                                : 'bg-red-50 text-red-700 border-red-200 group-hover:bg-red-100 group-hover:border-red-300'
                              }
                            `}
                          >
                            {month.isPaid ? 'Pago' : 'Pendente'}
                          </Badge>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNotificationToggle(index)}
                          className={`
                            h-14 w-14 p-0 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-sm
                            ${month.notificationEnabled
                              ? 'bg-blue-500 border-blue-400 text-white hover:bg-blue-600 shadow-blue-200/50'
                              : 'bg-white border-slate-300 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50'
                            }
                          `}
                          title={month.notificationEnabled ? 'Desativar notificação' : 'Ativar notificação'}
                        >
                          {month.notificationEnabled ? (
                            <Bell className="h-5 w-5" />
                          ) : (
                            <BellOff className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm"></div>
                        <span className="text-sm font-medium text-slate-700">Pago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full shadow-sm"></div>
                        <span className="text-sm font-medium text-slate-700">Pendente</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
                        <span className="text-sm font-medium text-slate-700">Notificação ativa</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="secondary" 
                        className="bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 font-medium px-3 py-1"
                      >
                        {paidCount}/{planoMonths.length} pagos
                      </Badge>
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">
                          R$ {(paidCount * parseFloat(atendimento.planoData?.valorMensal || '0')).toFixed(2)}
                        </span>
                        <span className="text-slate-500"> / R$ {(planoMonths.length * parseFloat(atendimento.planoData?.valorMensal || '0')).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PlanoMonthsVisualizer;
