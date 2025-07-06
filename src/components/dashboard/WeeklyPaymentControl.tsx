
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";

const WeeklyPaymentControl: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [planos, setPlanos] = useState<PlanoSemanal[]>([]);

  useEffect(() => {
    loadPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      loadPlanos();
    };

    const handleAtendimentosUpdated = () => {
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
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    // CARREGAR TODOS OS PLANOS SEMANAIS - PAGOS E PENDENTES
    const weeklyPlanos = allPlanos.filter((plano): plano is PlanoSemanal => {
      const isWeekly = plano.type === 'semanal';
      const hasClient = existingClientNames.has(plano.clientName);
      const noAnalysisId = !plano.analysisId;
      
      return isWeekly && hasClient && noAnalysisId;
    });
    
    setPlanos(weeklyPlanos);
  };

  const handlePaymentToggle = (planoId: string, clientName: string, isCurrentlyPending: boolean) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => {
      if (plano.id === planoId) {
        const newActive = !isCurrentlyPending;
        return { ...plano, active: newActive };
      }
      return plano;
    });
    
    savePlanos(updatedPlanos);
    
    const newStatus = isCurrentlyPending ? 'pago' : 'pendente';
    toast.success(`Pagamento de ${clientName} marcado como ${newStatus}!`);
    
    // SINCRONIZAÇÃO AUTOMÁTICA - Disparar múltiplos eventos para todos os controles
    setTimeout(() => {
      window.dispatchEvent(new Event('planosUpdated'));
      window.dispatchEvent(new Event('atendimentosUpdated'));
      window.dispatchEvent(new Event('monthlyPaymentsUpdated'));
      loadPlanos();
    }, 100);
  };

  const toggleClientExpansion = (clientName: string) => {
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

  const clientsWithPlanos = Object.keys(groupedPlanos);
  const pendingPlanos = planos.filter(p => p.active === true);

  return (
    <Card className={cn(
      "transition-all duration-300 border-2 w-full mb-6",
      isOpen 
        ? "border-[#0553C7]/40 bg-gradient-to-br from-[#0553C7]/5 to-blue-50/50 shadow-lg" 
        : "border-[#0553C7]/20 bg-white hover:border-[#0553C7]/30 hover:shadow-md"
    )}>
      <CardHeader 
        className="pb-3 border-b border-[#0553C7]/10 cursor-pointer hover:bg-[#0553C7]/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-[#0553C7]">
            <div className="p-2 rounded-full bg-[#0553C7]/10">
              <Calendar className="h-5 w-5 text-[#0553C7]" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Controle de Pagamentos Semanais</h3>
              <p className="text-sm text-[#0553C7]/70 font-normal">
                {pendingPlanos.length} pagamento(s) pendente(s)
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
      
      {isOpen && (
        <CardContent className="pt-4 px-6 pb-6" onClick={(e) => e.stopPropagation()}>
          {clientsWithPlanos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhum pagamento semanal encontrado</p>
              <p className="text-sm mt-2">Os pagamentos semanais aparecerão aqui quando houver planos ativos</p>
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
                        {clientPlanos.length} plano(s)
                      </Badge>
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        {clientPlanos.filter(p => p.active).length} pendente(s)
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
                          const isPending = plano.active;
                          
                          return (
                            <div 
                              key={plano.id} 
                              className={cn(
                                "border-l-4 p-4 rounded-lg transition-all duration-200",
                                isPending
                                  ? isOverdue
                                    ? "border-l-red-500 bg-red-50"
                                    : "border-l-[#0553C7] bg-white"
                                  : "border-l-green-500 bg-green-50"
                              )}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Badge className="bg-[#0553C7]/10 text-[#0553C7] border-[#0553C7]/20">
                                      {plano.week}ª Semana
                                    </Badge>
                                    {isOverdue && isPending && (
                                      <Badge variant="destructive" className="text-xs">
                                        {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrasado
                                      </Badge>
                                    )}
                                    {isPending ? (
                                      <Badge variant="destructive" className="text-xs">
                                        Pendente
                                      </Badge>
                                    ) : (
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
                                    handlePaymentToggle(plano.id, clientName, isPending);
                                  }}
                                  size="sm"
                                  className={cn(
                                    "transition-all duration-200 w-full sm:w-auto",
                                    isPending
                                      ? "bg-green-600 hover:bg-green-700 text-white"
                                      : "bg-orange-500 hover:bg-orange-600 text-white"
                                  )}
                                >
                                  {isPending ? (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      <span className="hidden sm:inline">Marcar como Pago</span>
                                      <span className="sm:hidden">Pagar</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-4 w-4 mr-1" />
                                      <span className="hidden sm:inline">Marcar Pendente</span>
                                      <span className="sm:hidden">Pendente</span>
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
      )}
    </Card>
  );
};

export default WeeklyPaymentControl;
