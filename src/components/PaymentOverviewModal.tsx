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

  const PaymentCard = ({ payment, isAdditional = false }: { payment: PlanoMensal | PlanoSemanal; isAdditional?: boolean }) => {
    const daysUntilDue = getDaysUntilDue(payment.dueDate);
    const urgencyLevel = getUrgencyLevel(daysUntilDue);
    const urgencyColor = getUrgencyColor(urgencyLevel, !payment.analysisId);
    const formattedDate = formatDate(payment.dueDate);
    
    return (
      <div className={`p-3 rounded-lg border transition-all duration-200 ${urgencyColor} ${isAdditional ? 'ml-4 mt-2' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {payment.type === 'plano' ? (
              <CreditCard className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <Badge 
              variant="outline" 
              className={`${urgencyColor} font-medium text-xs`}
            >
              {payment.type === 'plano' ? 'Mensal' : 'Semanal'}
            </Badge>
            {payment.analysisId && (
              <Badge 
                variant="outline" 
                className="bg-purple-100 text-purple-600 border-purple-200 text-xs"
              >
                Tarot
              </Badge>
            )}
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
                {formattedDate.date}
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

  // Novo state: manter quais clientes estão abertos (normalizados)
  const [expandedClients, setExpandedClients] = useState<string[]>([]);

  // Handler para expand/collapse usando nome normalizado
  const toggleExpandClient = useCallback((clientName: string) => {
    const normalized = normalizeClientName(clientName);
    setExpandedClients((prev) => {
      const isExpanding = !prev.includes(normalized);
      console.log(
        "[PaymentOverviewModal] Clique na setinha para '",
        clientName,
        "' (normalizado:", normalized, ")- Vai", isExpanding ? "abrir" : "fechar"
      );
      return isExpanding
        ? [...prev, normalized]
        : prev.filter((c) => c !== normalized)
    });
  }, []);

  const ClientPaymentGroup = ({ group, isPrincipal, expanded, onToggleExpand }: { group: GroupedPayment; isPrincipal: boolean; expanded: boolean; onToggleExpand: (clientName: string) => void }) => {
    const hasAdditionalPayments = group.additionalPayments.length > 0;

    // Log de renderização do painel expandido
    if (hasAdditionalPayments && expanded) {
      console.log("[DEBUG] Renderizando lista expandida do cliente:", group.clientName, group.additionalPayments);
    }

    return (
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
          {hasAdditionalPayments && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={() => {
                console.log("[PaymentOverviewModal] Clique no botão setinha de", group.clientName);
                onToggleExpand(group.clientName)
              }}
              aria-label={expanded ? "Fechar vencimentos do cliente" : "Abrir vencimentos do cliente"}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        <PaymentCard payment={group.mostUrgent} />
        
        {/* Lista de pagamentos adicionais se expandido */}
        {hasAdditionalPayments && expanded && (
          <div
            className="space-y-2 mt-2 border-2 border-dashed border-red-600 bg-red-100/60 p-2 rounded-lg"
            style={{ position: 'relative', zIndex: 2 }}
          >
            <div className="text-xs text-red-800 font-bold mb-2 uppercase">
              [DEBUG] Lista expandida aberta para {group.clientName}
            </div>
            {console.log('[DEBUG] Bloco visível mais interno do expandido!', group.clientName, group.additionalPayments)}
            {group.additionalPayments.map((payment) => (
              <PaymentCard 
                key={payment.id} 
                payment={payment} 
                isAdditional={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPaymentSection = (
    groupedPayments: GroupedPayment[], 
    title: string, 
    icon: React.ReactNode, 
    emptyMessage: string,
    isPrincipal: boolean = true
  ) => {
    const sectionColor = isPrincipal ? 'blue' : 'purple';
    const totalClients = groupedPayments.length;
    const totalPayments = groupedPayments.reduce((acc, group) => acc + group.totalPayments, 0);
    
    return (
      <div className="space-y-4">
        <div className={`flex items-center gap-2 pb-2 border-b border-${sectionColor}-200`}>
          {icon}
          <h3 className={`text-lg font-semibold text-${sectionColor}-800`}>{title}</h3>
          <div className="ml-auto flex gap-2">
            <Badge variant="secondary" className={`bg-${sectionColor}-100 text-${sectionColor}-600 border-${sectionColor}-200`}>
              {totalClients} cliente{totalClients !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className={`bg-${sectionColor}-100 text-${sectionColor}-600 border-${sectionColor}-200`}>
              {totalPayments} vencimento{totalPayments !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        {groupedPayments.length === 0 ? (
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-500 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedPayments.map((group) => {
              const normalizedName = normalizeClientName(group.clientName);
              return (
                <ClientPaymentGroup 
                  key={group.clientName}
                  group={group}
                  isPrincipal={isPrincipal}
                  expanded={expandedClients.includes(normalizedName)}
                  onToggleExpand={toggleExpandClient}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

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

  return (
    <Dialog onOpenChange={loadUpcomingPayments}>
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
              {(context === 'principal' || context === 'all') && filteredPayments.principal.length > 0 && (
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-blue-800">Atendimentos Principais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderPaymentSection(
                      filteredPayments.principal,
                      "",
                      <Users className="h-5 w-5 text-blue-600" />,
                      "Nenhum vencimento de atendimentos principais",
                      true
                    )}
                  </CardContent>
                </Card>
              )}
              
              {(context === 'tarot' || context === 'all') && filteredPayments.tarot.length > 0 && (
                <Card className="border-purple-200 bg-purple-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-purple-800">Análises de Tarot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderPaymentSection(
                      filteredPayments.tarot,
                      "",
                      <Sparkles className="h-5 w-5 text-purple-600" />,
                      "Nenhum vencimento de análises de tarot",
                      false
                    )}
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
