
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const WeeklyPaymentControl: React.FC = () => {
  // SEMPRE iniciar fechado independente do dispositivo
  const [isOpen, setIsOpen] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [planos, setPlanos] = useState<PlanoSemanal[]>([]);

  console.log('WeeklyPaymentControl - Render:', { 
    isOpen,
    planosCount: planos.length
  });

  useEffect(() => {
    console.log('WeeklyPaymentControl - useEffect inicial');
    loadPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      console.log('WeeklyPaymentControl - Evento planosUpdated recebido');
      loadPlanos();
    };

    const handleAtendimentosUpdated = () => {
      console.log('WeeklyPaymentControl - Evento atendimentosUpdated recebido');
      loadPlanos();
    };

    window.addEventListener('atendimentosUpdated', handleAtendimentosUpdated);
    window.addEventListener('planosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('atendimentosUpdated', handleAtendimentosUpdated);
      window.removeEventListener('planosUpdated', handlePlanosUpdated);
    };
  }, []);

  const loadPlanos = () => {
    console.log('WeeklyPaymentControl - Carregando planos...');
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    console.log('WeeklyPaymentControl - Todos os planos:', allPlanos.length);
    console.log('WeeklyPaymentControl - Clientes existentes:', Array.from(existingClientNames));
    
    // Filtrar APENAS planos semanais PENDENTES (active = true significa pendente)
    const pendingWeeklyPlanos = allPlanos.filter((plano): plano is PlanoSemanal => {
      const isWeekly = plano.type === 'semanal';
      const isPending = plano.active === true; // true = pendente, false = pago
      const hasClient = existingClientNames.has(plano.clientName);
      const noAnalysisId = !plano.analysisId;
      
      console.log(`WeeklyPaymentControl - Plano ${plano.id}:`, {
        client: plano.clientName,
        type: plano.type,
        active: plano.active,
        isWeekly,
        isPending,
        hasClient,
        noAnalysisId,
        shouldInclude: isWeekly && isPending && hasClient && noAnalysisId
      });
      
      return isWeekly && isPending && hasClient && noAnalysisId;
    });

    console.log('WeeklyPaymentControl - Planos pendentes filtrados:', {
      total: allPlanos.length,
      filtrados: pendingWeeklyPlanos.length,
      planos: pendingWeeklyPlanos.map(p => ({
        id: p.id,
        client: p.clientName,
        active: p.active,
        week: p.week
      }))
    });
    
    setPlanos(pendingWeeklyPlanos);
  };

  const handlePaymentToggle = (planoId: string, clientName: string, isCurrentlyPending: boolean) => {
    console.log('WeeklyPaymentControl - Toggle payment:', { 
      planoId, 
      clientName, 
      isCurrentlyPending,
      newStatus: isCurrentlyPending ? 'pago' : 'pendente'
    });
    
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => {
      if (plano.id === planoId) {
        const newActive = !isCurrentlyPending; // Inverter o status: true->false (pago), false->true (pendente)
        console.log(`WeeklyPaymentControl - Atualizando plano ${planoId}:`, {
          oldActive: plano.active,
          newActive
        });
        return { ...plano, active: newActive };
      }
      return plano;
    });
    
    savePlanos(updatedPlanos);
    
    const newStatus = isCurrentlyPending ? 'pago' : 'pendente';
    toast.success(`Pagamento de ${clientName} marcado como ${newStatus}!`);
    
    // Recarregar dados imediatamente para atualizar a interface
    console.log('WeeklyPaymentControl - Recarregando após toggle...');
    setTimeout(() => {
      loadPlanos();
      window.dispatchEvent(new Event('planosUpdated'));
    }, 100);
  };

  const toggleClientExpansion = (clientName: string) => {
    console.log('WeeklyPaymentControl - Toggle expansion:', clientName);
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const groupedPlanos = planos.reduce((acc, plano) => {
    if (!acc[plano.clientName]) {
      acc[plano.clientName] = [];
    }
    acc[plano.clientName].push(plano);
    return acc;
  }, {} as Record<string, PlanoSemanal[]>);

  const clientsWithPendingPayments = Object.keys(groupedPlanos);

  console.log('WeeklyPaymentControl - Estado final render:', { 
    isOpen, 
    totalPlanos: planos.length,
    clientsCount: clientsWithPendingPayments.length,
    clients: clientsWithPendingPayments
  });

  return (
    <div className="payment-controls-container payment-control-visible mb-6 w-full block">
      <Card className="payment-control-section border-[#0553C7]/20 bg-gradient-to-br from-[#0553C7]/5 to-blue-50/50 shadow-lg w-full">
        <Collapsible open={isOpen} onOpenChange={(open) => {
          console.log('WeeklyPaymentControl - Collapsible mudando para:', open);
          setIsOpen(open);
        }}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-[#0553C7]/10 transition-colors pb-3 border-b border-[#0553C7]/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-[#0553C7]">
                  <div className="p-2 rounded-full bg-[#0553C7]/10">
                    <Calendar className="h-5 w-5 text-[#0553C7]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Controle de Pagamentos Semanais</h3>
                    <p className="text-sm text-[#0553C7]/70 font-normal">
                      {clientsWithPendingPayments.length} cliente(s) com pagamentos pendentes
                    </p>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-[#0553C7]/10 text-[#0553C7] border-[#0553C7]/20 text-base px-3 py-1"
                  >
                    {planos.length}
                  </Badge>
                  <ChevronDown className={cn(
                    "h-6 w-6 text-[#0553C7] transition-transform duration-300",
                    isOpen && "rotate-180"
                  )} />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-4 px-6 pb-6">
              {clientsWithPendingPayments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Nenhum pagamento semanal pendente</p>
                  <p className="text-sm mt-2">Os pagamentos pendentes aparecerão aqui quando houver planos semanais ativos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupedPlanos).map(([clientName, clientPlanos]) => (
                    <div key={clientName} className="border border-[#0553C7]/20 rounded-lg bg-white shadow-sm">
                      <div 
                        className="p-4 cursor-pointer hover:bg-[#0553C7]/5 transition-colors flex items-center justify-between"
                        onClick={() => toggleClientExpansion(clientName)}
                      >
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-[#0553C7] text-lg">{clientName}</h4>
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            {clientPlanos.length} pendente(s)
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="p-1">
                          {expandedClients.has(clientName) ? (
                            <ChevronUp className="h-4 w-4 text-[#0553C7]" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-[#0553C7]" />
                          )}
                        </Button>
                      </div>
                      
                      {expandedClients.has(clientName) && (
                        <div className="border-t border-[#0553C7]/10 bg-[#0553C7]/5">
                          <div className="p-4 space-y-3">
                            {clientPlanos.map((plano) => {
                              const daysOverdue = getDaysOverdue(plano.dueDate);
                              const isOverdue = daysOverdue > 0;
                              const isPending = plano.active; // true = pendente, false = pago
                              
                              console.log(`WeeklyPaymentControl - Renderizando plano ${plano.id}:`, { 
                                client: plano.clientName,
                                active: plano.active,
                                isPending,
                                week: plano.week
                              });
                              
                              return (
                                <div 
                                  key={plano.id} 
                                  className={cn(
                                    "border-l-4 p-4 rounded-lg transition-all duration-200",
                                    isOverdue
                                      ? "border-l-red-500 bg-red-50"
                                      : "border-l-[#0553C7] bg-white"
                                  )}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <Badge className="bg-[#0553C7]/10 text-[#0553C7] border-[#0553C7]/20">
                                          {plano.week}ª Semana
                                        </Badge>
                                        {isOverdue && (
                                          <Badge variant="destructive" className="text-xs">
                                            {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrasado
                                          </Badge>
                                        )}
                                        <Badge variant="destructive" className="text-xs">
                                          Pendente
                                        </Badge>
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                                        <div>
                                          <span className="font-medium text-green-600">Valor:</span>
                                          <span className="ml-1 font-bold">R$ {plano.amount.toFixed(2)}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-orange-600">Vencimento:</span>
                                          <span className="ml-1 font-bold">{formatDate(plano.dueDate)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('WeeklyPaymentControl - Clique no botão:', { 
                                          planoId: plano.id, 
                                          clientName, 
                                          isPending 
                                        });
                                        handlePaymentToggle(plano.id, clientName, isPending);
                                      }}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 w-full sm:w-auto"
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      <span className="hidden sm:inline">Marcar como Pago</span>
                                      <span className="sm:hidden">Pagar</span>
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default WeeklyPaymentControl;
