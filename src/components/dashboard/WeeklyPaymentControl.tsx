
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
import { useIsMobile } from "@/hooks/use-mobile";

const WeeklyPaymentControl: React.FC = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false); // Sempre fechado por padrão
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [planos, setPlanos] = useState<PlanoSemanal[]>([]);

  console.log('WeeklyPaymentControl - Estado inicial:', { isOpen, isMobile });

  useEffect(() => {
    loadPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      console.log('WeeklyPaymentControl - Evento recebido, recarregando...');
      loadPlanos();
    };

    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    window.addEventListener('planosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
      window.removeEventListener('planosUpdated', handlePlanosUpdated);
    };
  }, []);

  const loadPlanos = () => {
    console.log('WeeklyPaymentControl - Carregando planos...');
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    // Filtrar apenas planos semanais ATIVOS (active = true significa não pago)
    const activeWeeklyPlanos = allPlanos.filter((plano): plano is PlanoSemanal => 
      plano.type === 'semanal' && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );

    console.log('WeeklyPaymentControl - Planos filtrados:', {
      total: allPlanos.length,
      semanais: activeWeeklyPlanos.length,
      activeWeeklyPlanos: activeWeeklyPlanos.map(p => ({
        id: p.id,
        client: p.clientName,
        active: p.active,
        week: p.week
      }))
    });
    
    setPlanos(activeWeeklyPlanos);
  };

  const handlePaymentToggle = (planoId: string, clientName: string, isCurrentlyPaid: boolean) => {
    const wasExpanded = expandedClients.has(clientName);
    
    console.log('WeeklyPaymentControl - Toggling payment:', { 
      planoId, 
      clientName, 
      isCurrentlyPaid,
      wasExpanded
    });
    
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === planoId ? { ...plano, active: !isCurrentlyPaid } : plano
    );
    
    console.log('WeeklyPaymentControl - Salvando planos atualizados...');
    savePlanos(updatedPlanos);
    
    // Atualizar estado local imediatamente
    setPlanos(prevPlanos => 
      prevPlanos.map(plano => 
        plano.id === planoId ? { ...plano, active: !isCurrentlyPaid } : plano
      )
    );
    
    // Manter cliente expandido após pagamento
    if (wasExpanded) {
      setExpandedClients(prev => new Set([...prev, clientName]));
    }
    
    const newStatus = isCurrentlyPaid ? 'pendente' : 'pago';
    toast.success(`Pagamento de ${clientName} marcado como ${newStatus}!`);
    
    // Forçar atualização
    setTimeout(() => {
      console.log('WeeklyPaymentControl - Disparando evento de atualização...');
      window.dispatchEvent(new Event('planosUpdated'));
    }, 100);
  };

  const toggleClientExpansion = (clientName: string) => {
    console.log('WeeklyPaymentControl - Toggling client expansion:', clientName);
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    console.log('WeeklyPaymentControl - New expanded clients:', Array.from(newExpanded));
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

  console.log('WeeklyPaymentControl - Renderizando:', { 
    isOpen, 
    planosCount: planos.length, 
    groupedCount: Object.keys(groupedPlanos).length,
    expandedClients: Array.from(expandedClients)
  });

  return (
    <div className="payment-controls-container payment-control-visible mb-6 w-full block">
      <Card className="payment-control-section border-[#0553C7]/20 bg-gradient-to-br from-[#0553C7]/5 to-blue-50/50 shadow-lg w-full">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
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
                      {Object.keys(groupedPlanos).length} cliente(s) ativo(s)
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
              {Object.keys(groupedPlanos).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Nenhum pagamento semanal ativo</p>
                  <p className="text-sm mt-2">Os pagamentos aparecerão aqui quando houver planos semanais ativos</p>
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
                          <Badge className="bg-[#0553C7]/10 text-[#0553C7] border-[#0553C7]/20">
                            {clientPlanos.length} pagamento(s)
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
                              const isPaid = !plano.active; // active = false significa pago
                              
                              console.log('WeeklyPaymentControl - Renderizando plano:', { 
                                id: plano.id, 
                                client: plano.clientName,
                                active: plano.active, 
                                isPaid,
                                week: plano.week
                              });
                              
                              return (
                                <div 
                                  key={plano.id} 
                                  className={cn(
                                    "border-l-4 p-4 rounded-lg transition-all duration-200",
                                    isPaid 
                                      ? "border-l-green-500 bg-green-50"
                                      : isOverdue
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
                                        {isOverdue && !isPaid && (
                                          <Badge variant="destructive" className="text-xs">
                                            {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrasado
                                          </Badge>
                                        )}
                                        {isPaid && (
                                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                            ✓ Pago
                                          </Badge>
                                        )}
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
                                        console.log('WeeklyPaymentControl - Botão clicado:', { 
                                          planoId: plano.id, 
                                          clientName, 
                                          isPaid 
                                        });
                                        handlePaymentToggle(plano.id, clientName, isPaid);
                                      }}
                                      size="sm"
                                      className={cn(
                                        "transition-all duration-200 w-full sm:w-auto",
                                        isPaid
                                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                                          : "bg-green-600 hover:bg-green-700 text-white"
                                      )}
                                    >
                                      {isPaid ? (
                                        <>
                                          <X className="h-4 w-4 mr-1" />
                                          <span className="hidden sm:inline">Marcar Pendente</span>
                                          <span className="sm:hidden">Pendente</span>
                                        </>
                                      ) : (
                                        <>
                                          <Check className="h-4 w-4 mr-1" />
                                          <span className="hidden sm:inline">Marcar Pago</span>
                                          <span className="sm:hidden">Pagar</span>
                                        </>
                                      )}
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
