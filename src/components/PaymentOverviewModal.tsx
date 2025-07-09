
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import { getNextWeekDays } from "@/utils/weekDayCalculator";
import { usePaymentNotifications } from "@/components/tarot/payment-notifications/usePaymentNotifications";
import PaymentModalHeader from "./payment-overview/PaymentModalHeader";
import PaymentModalContent from "./payment-overview/PaymentModalContent";
import PaymentStats from "./payment-overview/PaymentStats";

interface PaymentOverviewModalProps {
  children: React.ReactNode;
  context?: 'principal' | 'tarot' | 'all';
}

interface GroupedPayment {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  totalPayments: number;
}

interface SeparatedGroupedPayments {
  principal: GroupedPayment[];
  tarot: GroupedPayment[];
}

const PaymentOverviewModal: React.FC<PaymentOverviewModalProps> = ({ children, context = 'all' }) => {
  const { getPlanos, getAtendimentos, getTarotAnalyses, savePlanos } = useUserDataService();
  const [separatedGroupedPayments, setSeparatedGroupedPayments] = useState<SeparatedGroupedPayments>({
    principal: [],
    tarot: []
  });

  const cleanOrphanedPlanos = useCallback(() => {
    console.log('PaymentOverviewModal - Iniciando limpeza de planos órfãos...');
    
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const tarotAnalyses = getTarotAnalyses();
    
    console.log('PaymentOverviewModal - Dados atuais:', {
      planos: allPlanos.length,
      atendimentos: atendimentos.length,
      tarotAnalyses: tarotAnalyses.length
    });
    
    const atendimentoClientMap = new Map(atendimentos.map(a => [a.nome.toLowerCase().trim(), a.id]));
    const tarotClientMap = new Map();
    
    tarotAnalyses.forEach(a => {
      const clientName = a.nomeCliente || a.clientName;
      if (clientName) {
        const normalizedName = clientName.toLowerCase().trim();
        tarotClientMap.set(normalizedName, a.id);
      }
    });
    
    const validPlanos = allPlanos.filter(plano => {
      if (!plano.clientName) {
        console.log('PaymentOverviewModal - Removendo plano sem nome de cliente:', plano.id);
        return false;
      }
      
      const clientNameNormalized = plano.clientName.toLowerCase().trim();
      const isPrincipal = !plano.analysisId;
      
      if (isPrincipal) {
        const exists = atendimentoClientMap.has(clientNameNormalized);
        if (!exists) {
          console.log('PaymentOverviewModal - Removendo plano principal órfão:', {
            id: plano.id,
            clientName: plano.clientName,
            type: plano.type
          });
        }
        return exists;
      } else {
        const exists = tarotClientMap.has(clientNameNormalized);
        if (!exists) {
          console.log('PaymentOverviewModal - Removendo plano tarot órfão:', {
            id: plano.id,
            clientName: plano.clientName,
            analysisId: plano.analysisId,
            type: plano.type
          });
        }
        return exists;
      }
    });
    
    if (validPlanos.length !== allPlanos.length) {
      const removedCount = allPlanos.length - validPlanos.length;
      console.log(`PaymentOverviewModal - ${removedCount} planos órfãos removidos`);
      savePlanos(validPlanos);
      return true;
    }
    
    return false;
  }, [getPlanos, getAtendimentos, getTarotAnalyses, savePlanos]);

  const generateTarotPayments = useCallback(() => {
    const tarotAnalyses = getTarotAnalyses();
    const generatedPayments: (PlanoMensal | PlanoSemanal)[] = [];
    
    tarotAnalyses.forEach(analysis => {
      const clientName = analysis.nomeCliente || analysis.clientName;
      if (!clientName) return;
      
      console.log('PaymentOverviewModal - Gerando pagamentos para:', clientName, 'Análise completa:', analysis);
      
      const startDate = new Date(analysis.dataInicio || analysis.dataAtendimento || new Date());
      
      if (analysis.planoAtivo && analysis.planoData) {
        const totalMonths = parseInt(analysis.planoData.meses);
        const monthlyAmount = parseFloat(analysis.planoData.valorMensal);
        
        let dueDay = 5;
        if (analysis.planoData && 'diaVencimento' in analysis.planoData && analysis.planoData.diaVencimento) {
          const parsedDay = parseInt(analysis.planoData.diaVencimento as string);
          if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
            dueDay = parsedDay;
          }
        }
        
        console.log('PaymentOverviewModal - Gerando plano mensal para cliente:', clientName, 'Total meses:', totalMonths, 'Dia vencimento:', dueDay);
        
        for (let month = 1; month <= totalMonths; month++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + month);
          
          const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
          const actualDueDay = Math.min(dueDay, lastDayOfMonth);
          dueDate.setDate(actualDueDay);
          
          console.log(`PaymentOverviewModal - Mês ${month}: vencimento em ${dueDate.toDateString()}`);
          
          generatedPayments.push({
            id: `${analysis.id}-plano-${month}`,
            clientName,
            type: 'plano',
            amount: monthlyAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            month,
            totalMonths,
            created: new Date().toISOString(),
            active: true,
            notificationTiming: 'on_due_date',
            analysisId: analysis.id
          } as PlanoMensal);
        }
      }
      
      if (analysis.semanalAtivo && analysis.semanalData) {
        const totalWeeks = parseInt(analysis.semanalData.semanas);
        const weeklyAmount = parseFloat(analysis.semanalData.valorSemanal);
        
        let dayOfWeek = 'sexta';
        if ('diaVencimento' in analysis.semanalData && analysis.semanalData.diaVencimento) {
          dayOfWeek = analysis.semanalData.diaVencimento as string;
        }
        
        console.log('PaymentOverviewModal - Gerando plano semanal para cliente:', clientName, 'Total semanas:', totalWeeks, 'Dia da semana:', dayOfWeek);
        
        const weekDates = getNextWeekDays(totalWeeks, dayOfWeek, startDate);
        
        weekDates.forEach((dueDate, index) => {
          const week = index + 1;
          
          console.log(`PaymentOverviewModal - Semana ${week}: vencimento em ${dueDate.toDateString()}`);
          
          generatedPayments.push({
            id: `${analysis.id}-semanal-${week}`,
            clientName,
            type: 'semanal',
            amount: weeklyAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            week,
            totalWeeks,
            created: new Date().toISOString(),
            active: true,
            notificationTiming: 'on_due_date',
            analysisId: analysis.id
          } as PlanoSemanal);
        });
      }
    });
    
    return generatedPayments;
  }, [getTarotAnalyses]);

  const normalizeClientName = (name: string) => name.toLowerCase().trim();

  const loadUpcomingPayments = useCallback(() => {
    console.log('PaymentOverviewModal - Carregando dados...');
    
    cleanOrphanedPlanos();
    
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const tarotAnalyses = getTarotAnalyses();
    
    console.log('PaymentOverviewModal - Dados após limpeza:', {
      planos: allPlanos.length,
      atendimentos: atendimentos.length,
      tarotAnalyses: tarotAnalyses.length
    });

    const activePlanos = allPlanos.filter(plano => plano.active);
    console.log('PaymentOverviewModal - Planos ativos:', activePlanos.length);

    const generatedTarotPayments = generateTarotPayments();
    console.log('PaymentOverviewModal - Pagamentos de tarot gerados:', generatedTarotPayments.length);

    const existingAtendimentoClients = new Set(
      atendimentos.map(a => a.nome.toLowerCase().trim())
    );
    
    const existingTarotClients = new Set();
    tarotAnalyses.forEach(a => {
      const clientName = a.nomeCliente || a.clientName;
      if (clientName) {
        existingTarotClients.add(clientName.toLowerCase().trim());
      }
    });

    console.log('PaymentOverviewModal - Clientes existentes:', {
      atendimento: existingAtendimentoClients.size,
      tarot: existingTarotClients.size
    });

    const principalPlanos = activePlanos.filter(plano => {
      if (!plano.clientName) return false;
      const isPrincipal = !plano.analysisId;
      const clientExists = existingAtendimentoClients.has(plano.clientName.toLowerCase().trim());
      return isPrincipal && clientExists;
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tarotPlanos = generatedTarotPayments.filter(payment => {
      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`PaymentOverviewModal - Avaliando pagamento ${payment.clientName}: vencimento em ${payment.dueDate}, diferença: ${daysDiff} dias`);
      
      return daysDiff >= -7 && daysDiff <= 60;
    });

    console.log('PaymentOverviewModal - Planos separados:', {
      principal: principalPlanos.length,
      tarot: tarotPlanos.length
    });

    const groupedPrincipal = groupPaymentsByClient(principalPlanos);
    const groupedTarot = groupPaymentsByClient(tarotPlanos);

    setSeparatedGroupedPayments({
      principal: groupedPrincipal.slice(0, 20),
      tarot: groupedTarot.slice(0, 20)
    });

    console.log('PaymentOverviewModal - Grupos finais:', {
      principal: groupedPrincipal.length,
      tarot: groupedTarot.length
    });
  }, [getPlanos, getAtendimentos, getTarotAnalyses, cleanOrphanedPlanos, generateTarotPayments]);

  useEffect(() => {
    const handleDataUpdated = (event?: CustomEvent) => {
      console.log('PaymentOverviewModal - Dados atualizados, recarregando...', event?.detail);
      // Delay maior para garantir que todos os dados foram salvos
      setTimeout(() => {
        loadUpcomingPayments();
      }, 200);
    };

    const events = [
      'atendimentosUpdated',
      'tarotAnalysesUpdated', 
      'planosUpdated',
      'tarot-payment-updated',
      'paymentStatusChanged'
    ];
    
    events.forEach(eventName => {
      window.addEventListener(eventName, handleDataUpdated as EventListener);
    });

    // Também escutar eventos de storage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'planos' || event.key === 'analises' || event.key === 'atendimentos') {
        console.log('PaymentOverviewModal - Storage alterado:', event.key);
        setTimeout(() => {
          loadUpcomingPayments();
        }, 300);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleDataUpdated as EventListener);
      });
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUpcomingPayments]);

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

  const getUrgencyColor = (urgencyLevel: string, isPrincipal: boolean = true) => {
    const baseColor = isPrincipal ? 'blue' : 'purple';
    
    switch (urgencyLevel) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'today': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'urgent': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return `text-${baseColor}-600 bg-${baseColor}-50 border-${baseColor}-200`;
    }
  };

  const getUrgencyText = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} ${Math.abs(daysUntilDue) === 1 ? 'dia' : 'dias'} em atraso`;
    if (daysUntilDue === 0) return 'Vence hoje';
    if (daysUntilDue === 1) return 'Vence amanhã';
    return `${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'} restantes`;
  };

  const [expandedClients, setExpandedClients] = useState<string[]>([]);

  const toggleExpandClient = useCallback((normalizedClientName: string) => {
    setExpandedClients((prev) => {
      const isExpanding = !prev.includes(normalizedClientName);
      return isExpanding
        ? [...prev, normalizedClientName]
        : prev.filter((c) => c !== normalizedClientName)
    });
  }, []);

  const getFilteredPayments = () => {
    switch (context) {
      case 'principal':
        return { principal: separatedGroupedPayments.principal, tarot: [] };
      case 'tarot':
        return { principal: [], tarot: separatedGroupedPayments.tarot };
      default:
        return separatedGroupedPayments;
    }
  };

  const filteredPayments = getFilteredPayments();
  const totalGroups = filteredPayments.principal.length + filteredPayments.tarot.length;

  const {
    groupedPayments: groupedTarotPaymentsState,
    markAsPaid: markAsPaidTarot,
    refresh: refreshTarotPayments,
  } = usePaymentNotifications();

  const [filteredTarotGroups, setFilteredTarotGroups] = useState<GroupedPayment[]>([]);

  const syncTarotPaymentsToModal = useCallback(() => {
    if (context === "tarot" || context === "all") {
      console.log('PaymentOverviewModal - Sincronizando pagamentos tarot:', groupedTarotPaymentsState.length);
      setFilteredTarotGroups(groupedTarotPaymentsState.slice(0, 20));
    }
  }, [groupedTarotPaymentsState, context]);

  useEffect(() => {
    syncTarotPaymentsToModal();
  }, [groupedTarotPaymentsState, context]);

  const handleMarkAsPaidTarot = useCallback((paymentId: string) => {
    console.log('PaymentOverviewModal - Marcando como pago:', paymentId);
    markAsPaidTarot(paymentId);
    
    // Atualizar estado local imediatamente
    setFilteredTarotGroups((prevGroups) =>
      prevGroups
        .map(group => {
          if (group.mostUrgent.id === paymentId) {
            const updatedPayments = group.additionalPayments.filter(p => p.id !== paymentId);
            if (updatedPayments.length > 0) {
              return {
                ...group,
                mostUrgent: updatedPayments[0],
                additionalPayments: updatedPayments.slice(1),
                totalPayments: updatedPayments.length,
              };
            } else {
              return null;
            }
          } else {
            return group;
          }
        })
        .filter((group): group is GroupedPayment => !!group && !!group.mostUrgent)
    );

    // Forçar atualização dos dados principais
    setTimeout(() => {
      loadUpcomingPayments();
      refreshTarotPayments();
    }, 300);

    toast({ title: "Pagamento marcado como pago!" });
  }, [markAsPaidTarot, loadUpcomingPayments, refreshTarotPayments]);

  return (
    <Dialog onOpenChange={(open) => {
      if (open) {
        console.log('PaymentOverviewModal - Modal aberto, carregando dados...');
        loadUpcomingPayments();
        refreshTarotPayments();
        setTimeout(syncTarotPaymentsToModal, 200);
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <PaymentModalHeader context={context} />
        <div className="space-y-6">
          <PaymentStats totalGroups={totalGroups} />
          {totalGroups > 0 && (
            <PaymentModalContent
              context={context}
              filteredPayments={filteredPayments}
              filteredTarotGroups={filteredTarotGroups}
              expandedClients={expandedClients}
              toggleExpandClient={toggleExpandClient}
              normalizeClientName={normalizeClientName}
              getDaysUntilDue={getDaysUntilDue}
              getUrgencyLevel={getUrgencyLevel}
              getUrgencyColor={getUrgencyColor}
              getUrgencyText={getUrgencyText}
              formatDate={formatDate}
              handleMarkAsPaidTarot={handleMarkAsPaidTarot}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentOverviewModal;
