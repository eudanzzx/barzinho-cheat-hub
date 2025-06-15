import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CreditCard, AlertTriangle, Users, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import { getNextWeekDays } from "@/utils/weekDayCalculator";
import PaymentSection from "./payment-overview/PaymentSection";
import { CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePaymentNotifications } from "@/components/tarot/payment-notifications/usePaymentNotifications";

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
    
    // Criar mapas para busca mais eficiente
    const atendimentoClientMap = new Map(atendimentos.map(a => [a.nome.toLowerCase().trim(), a.id]));
    const tarotClientMap = new Map();
    
    // Mapear clientes de tarot considerando ambos os campos de nome
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
      
      // Gerar pagamentos para planos mensais
      if (analysis.planoAtivo && analysis.planoData) {
        const totalMonths = parseInt(analysis.planoData.meses);
        const monthlyAmount = parseFloat(analysis.planoData.valorMensal);
        
        // Usar o dia de vencimento definido no plano ou dia 5 como padrão
        let dueDay = 5;
        if (analysis.planoData && 'diaVencimento' in analysis.planoData && analysis.planoData.diaVencimento) {
          const parsedDay = parseInt(analysis.planoData.diaVencimento as string);
          if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
            dueDay = parsedDay;
          }
        }
        
        console.log('PaymentOverviewModal - Gerando plano mensal para cliente:', clientName, 'Total meses:', totalMonths, 'Dia vencimento:', dueDay);
        
        for (let month = 1; month <= totalMonths; month++) {
          // Calcular o vencimento usando o mesmo dia definido no plano
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + month);
          
          // Ajustar para o dia de vencimento correto
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
      
      // Gerar pagamentos para planos semanais usando getNextWeekDays
      if (analysis.semanalAtivo && analysis.semanalData) {
        const totalWeeks = parseInt(analysis.semanalData.semanas);
        const weeklyAmount = parseFloat(analysis.semanalData.valorSemanal);
        
        // Verificar se diaVencimento existe no semanalData
        let dayOfWeek = 'sexta'; // padrão
        if ('diaVencimento' in analysis.semanalData && analysis.semanalData.diaVencimento) {
          dayOfWeek = analysis.semanalData.diaVencimento as string;
        }
        
        console.log('PaymentOverviewModal - Gerando plano semanal para cliente:', clientName, 'Total semanas:', totalWeeks, 'Dia da semana:', dayOfWeek);
        
        // Usar getNextWeekDays para obter as datas corretas
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

  // Novo util para normalizar nomes de clientes
  const normalizeClientName = (name: string) => name.toLowerCase().trim();

  // Função para converter nomes dos dias em números
  const convertDayNameToNumber = (dayName: string): number => {
    const dayMap: { [key: string]: number } = {
      'domingo': 0,
      'segunda': 1,
      'terca': 2,
      'quarta': 3,
      'quinta': 4,
      'sexta': 5,
      'sabado': 6,
      'segunda-feira': 1,
      'terça-feira': 2,
      'quarta-feira': 3,
      'quinta-feira': 4,
      'sexta-feira': 5,
      'sábado': 6
    };
    
    const normalizedDayName = dayName.toLowerCase().trim();
    return dayMap[normalizedDayName] || 1; // segunda-feira como padrão
  };

  const loadUpcomingPayments = useCallback(() => {
    console.log('PaymentOverviewModal - Carregando dados...');
    
    // Limpar planos órfãos primeiro
    cleanOrphanedPlanos();
    
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const tarotAnalyses = getTarotAnalyses();
    
    console.log('PaymentOverviewModal - Dados após limpeza:', {
      planos: allPlanos.length,
      atendimentos: atendimentos.length,
      tarotAnalyses: tarotAnalyses.length
    });

    // Filtrar apenas planos ativos
    const activePlanos = allPlanos.filter(plano => plano.active);
    console.log('PaymentOverviewModal - Planos ativos:', activePlanos.length);

    // Gerar pagamentos dinâmicos para tarot
    const generatedTarotPayments = generateTarotPayments();
    console.log('PaymentOverviewModal - Pagamentos de tarot gerados:', generatedTarotPayments.length);

    // Criar Sets com os nomes dos clientes existentes
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

    // Separar planos por tipo - apenas planos principais (sem analysisId)
    const principalPlanos = activePlanos.filter(plano => {
      if (!plano.clientName) return false;
      const isPrincipal = !plano.analysisId;
      const clientExists = existingAtendimentoClients.has(plano.clientName.toLowerCase().trim());
      return isPrincipal && clientExists;
    });
    
    // Para tarot, usar os pagamentos gerados dinamicamente e mostrar todos os próximos
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tarotPlanos = generatedTarotPayments.filter(payment => {
      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`PaymentOverviewModal - Avaliando pagamento ${payment.clientName}: vencimento em ${payment.dueDate}, diferença: ${daysDiff} dias`);
      
      // Mostrar pagamentos dos próximos 60 dias e até 7 dias em atraso
      return daysDiff >= -7 && daysDiff <= 60;
    });

    console.log('PaymentOverviewModal - Planos separados:', {
      principal: principalPlanos.length,
      tarot: tarotPlanos.length
    });

    // Agrupar e definir estado
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
    const handleDataUpdated = () => {
      console.log('PaymentOverviewModal - Dados atualizados, recarregando...');
      setTimeout(() => {
        loadUpcomingPayments();
      }, 100);
    };

    const events = [
      'atendimentosUpdated',
      'tarotAnalysesUpdated', 
      'planosUpdated'
    ];
    
    events.forEach(eventName => {
      window.addEventListener(eventName, handleDataUpdated);
    });
    
    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleDataUpdated);
      });
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

  // Novo state: manter quais clientes estão abertos (normalizados)
  const [expandedClients, setExpandedClients] = useState<string[]>([]);

  // Handler para expand/collapse usando nome normalizado
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

  const getModalTitle = () => {
    switch (context) {
      case 'principal':
        return 'Próximos Vencimentos - Atendimentos Principais';
      case 'tarot':
        return 'Próximos Vencimentos - Análises de Tarot';
      default:
        return 'Próximos Vencimentos';
    }
  };

  // Hook para pagamentos de tarot (reutiliza lógica/tela do Tarot)
  const {
    groupedPayments: groupedTarotPaymentsState,
    markAsPaid: markAsPaidTarot,
    refresh: refreshTarotPayments,
  } = usePaymentNotifications();

  // Estado para controlar os pagamentos de tarot exibidos na UI (sincroniza ao abrir o modal)
  const [filteredTarotGroups, setFilteredTarotGroups] = useState<GroupedPayment[]>([]);

  // Recarregar pagamentos ao abrir/atualizar modal
  const syncTarotPaymentsToModal = useCallback(() => {
    // Só se contexto for 'tarot' ou 'all'
    if (context === "tarot" || context === "all") {
      setFilteredTarotGroups(groupedTarotPaymentsState.slice(0, 20));
    }
  }, [groupedTarotPaymentsState, context]);

  useEffect(() => {
    syncTarotPaymentsToModal();
    // eslint-disable-next-line
  }, [groupedTarotPaymentsState, context]);

  // Refletir ação: ao marcar como pago tira da UI instantaneamente!
  const handleMarkAsPaidTarot = useCallback((paymentId: string) => {
    markAsPaidTarot(paymentId);
    setFilteredTarotGroups((prevGroups) =>
      prevGroups
        .map(group => ({
          ...group,
          // Remove dos pagamentos do grupo o pago
          mostUrgent: group.mostUrgent.id === paymentId
            ? null
            : group.mostUrgent,
          additionalPayments: group.additionalPayments.filter(p => p.id !== paymentId)
        }))
        // Remove grupos que ficaram vazios
        .filter(group => group.mostUrgent)
    );
    toast.success("Pagamento marcado como pago!");
  }, [markAsPaidTarot]);

  // Adaptação ao renderizar a seção de tarot, inserindo botão "Marcar como pago"
  function TarotPaymentSection({
    groupedPayments
  }: { groupedPayments: GroupedPayment[] }) {
    if (groupedPayments.length === 0) {
      return (
        <div className="p-4 text-slate-500 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-3 opacity-40" />
          Nenhum vencimento de análises de tarot
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {groupedPayments.map(group => (
          <div key={group.clientName} className="rounded-lg border border-purple-200 bg-purple-50/30 p-4 shadow-sm">
            <div className="font-semibold text-slate-800 mb-2">{group.clientName}</div>
            <div className="space-y-3">
              {/* mostUrgent sempre vem primeiro */}
              {[group.mostUrgent, ...group.additionalPayments].map(payment =>
                payment ? (
                  <div key={payment.id} className="flex items-center">
                    {/* Card visual igual à sua referência */}
                    <div className="flex-1">
                      <div className="rounded-xl border border-[#ceb8fa] bg-[#f6f0ff] shadow-sm p-4 flex flex-col gap-2 relative">
                        <div className="flex justify-between items-center mb-1">
                          <Badge
                            variant="outline"
                            className="border-transparent bg-white/60 text-[#8e46dd] font-semibold px-3 py-1 text-xs"
                            style={{ boxShadow: 'none' }}
                          >
                            {payment.type === "plano" ? "Mensal" : "Semanal"}
                          </Badge>
                          <span className="text-lg font-bold text-green-600">
                            R$ {payment.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#8e46dd] font-medium">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {(() => {
                              const date = new Date(payment.dueDate);
                              return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;
                            })()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-[#9156e0]">
                          {(() => {
                            // Urgência estilizada
                            const daysUntilDue = (() => {
                              const today = new Date(); today.setHours(0,0,0,0);
                              const due = new Date(payment.dueDate); due.setHours(0,0,0,0);
                              return Math.ceil((due.getTime() - today.getTime()) / (1000*60*60*24));
                            })();
                            if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} dia${Math.abs(daysUntilDue) === 1 ? '' : 's'} em atraso`;
                            if (daysUntilDue === 0) return "Vence hoje";
                            if (daysUntilDue === 1) return "Vence amanhã";
                            return `${daysUntilDue} dias restantes`;
                          })()}
                        </div>
                      </div>
                    </div>
                    {/* Botão marcar pago */}
                    <button
                      className="ml-3 p-0.5 px-3 h-9 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-sm flex gap-1 items-center shadow-md transition"
                      title="Marcar como pago"
                      onClick={() => handleMarkAsPaidTarot(payment.id)}
                    >
                      <CheckCircle className="h-5 w-5 mr-1" />
                      Pago
                    </button>
                  </div>
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Dialog onOpenChange={() => {
      loadUpcomingPayments();
      // Atualizar lista de tarot do hook
      refreshTarotPayments();
      setTimeout(syncTarotPaymentsToModal, 100);
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-blue-600" />
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            Visualize e gerencie os próximos vencimentos de pagamentos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {totalGroups === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    Nenhum plano próximo ao vencimento
                  </h3>
                  <p className="text-slate-500">
                    Não há planos ativos com vencimentos próximos.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-6 ${context === 'all' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* PRINCIPAL (sem alteração) */}
              {(context === 'principal' || context === 'all') && filteredPayments.principal.length > 0 && (
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-blue-800">Atendimentos Principais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PaymentSection
                      groupedPayments={filteredPayments.principal}
                      // ... keep existing code (props) the same ...
                      title=""
                      icon={<Users className="h-5 w-5 text-blue-600" />}
                      emptyMessage="Nenhum vencimento de atendimentos principais"
                      isPrincipal={true}
                      expandedClients={expandedClients}
                      toggleExpandClient={toggleExpandClient}
                      normalizeClientName={normalizeClientName}
                      getDaysUntilDue={getDaysUntilDue}
                      getUrgencyLevel={getUrgencyLevel}
                      getUrgencyColor={getUrgencyColor}
                      getUrgencyText={getUrgencyText}
                      formatDate={formatDate}
                    />
                  </CardContent>
                </Card>
              )}

              {/* TAROT (agora com lista customizada e botão de pagamento) */}
              {(context === 'tarot' || context === 'all') && (filteredTarotGroups.length > 0) && (
                <Card className="border-purple-200 bg-purple-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-purple-800">Análises de Tarot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TarotPaymentSection groupedPayments={filteredTarotGroups} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentOverviewModal;
