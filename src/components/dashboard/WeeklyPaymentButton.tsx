
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";
import { useIsMobile } from "@/hooks/use-mobile";

const WeeklyPaymentButton: React.FC = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  
  const [planos, setPlanos] = useState<PlanoSemanal[]>([]);

  console.log("WeeklyPaymentButton - Estado atual:", { isOpen, isMobile, planosCount: planos.length });

  useEffect(() => {
    loadPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      console.log("WeeklyPaymentButton - Evento atendimentosUpdated recebido");
      loadPlanos();
    };

    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    window.addEventListener('planosUpdated', handlePlanosUpdated);
    window.addEventListener('monthlyPaymentsUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
      window.removeEventListener('planosUpdated', handlePlanosUpdated);
      window.removeEventListener('monthlyPaymentsUpdated', handlePlanosUpdated);
    };
  }, []);

  const loadPlanos = () => {
    console.log("WeeklyPaymentButton - Carregando TODOS os planos semanais...");
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    // TODOS OS PLANOS SEMANAIS - PAGOS E PENDENTES
    const weeklyPlanos = allPlanos.filter((plano): plano is PlanoSemanal => 
      plano.type === 'semanal' && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );

    console.log("WeeklyPaymentButton - Planos carregados:", { 
      total: allPlanos.length, 
      semanais: weeklyPlanos.length,
      detalhes: weeklyPlanos.map(p => ({ 
        id: p.id, 
        client: p.clientName, 
        active: p.active,
        isPaid: !p.active,
        week: p.week 
      }))
    });

    setPlanos(weeklyPlanos);
  };

  const handleToggleOpen = () => {
    console.log("WeeklyPaymentButton - Alternando estado:", { atual: isOpen, novo: !isOpen });
    setIsOpen(!isOpen);
  };

  const handlePaymentToggle = (planoId: string, clientName: string) => {
    console.log("WeeklyPaymentButton - Toggle pagamento:", { planoId, clientName });
    const allPlanos = getPlanos();
    const planoAtual = allPlanos.find(p => p.id === planoId);
    
    if (!planoAtual) return;
    
    const novoStatus = !planoAtual.active;
    
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === planoId ? { ...plano, active: novoStatus } : plano
    );
    
    savePlanos(updatedPlanos);
    toast.success(
      novoStatus 
        ? `Pagamento de ${clientName} marcado como pendente!`
        : `Pagamento de ${clientName} marcado como pago!`
    );
    
    // Atualização imediata
    setTimeout(() => {
      window.dispatchEvent(new Event('atendimentosUpdated'));
      window.dispatchEvent(new Event('planosUpdated'));
      window.dispatchEvent(new Event('monthlyPaymentsUpdated'));
      loadPlanos();
    }, 100);
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

  const pendingPlanos = planos.filter(p => p.active);

  return (
    <Card className={cn(
      "transition-all duration-300 border-2",
      isOpen 
        ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg" 
        : "border-emerald-200 bg-white hover:border-emerald-300 hover:shadow-md"
    )}>
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-emerald-50 transition-colors"
        onClick={handleToggleOpen}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-emerald-700">
            <div className="p-2 rounded-full bg-emerald-100">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pagamentos Semanais</h3>
              <p className="text-sm text-emerald-600 font-normal">
                {planos.length} total | {pendingPlanos.length} pendente(s)
              </p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-emerald-100 text-emerald-800 border-emerald-200"
            >
              {planos.length}
            </Badge>
            <ChevronDown className={cn(
              "h-5 w-5 text-emerald-600 transition-transform duration-300",
              isOpen && "rotate-180"
            )} />
          </div>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-3 mt-4">
            {planos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum pagamento semanal encontrado</p>
              </div>
            ) : (
              planos.map((plano) => {
                const daysOverdue = getDaysOverdue(plano.dueDate);
                const isOverdue = daysOverdue > 0;
                const isPaid = !plano.active;
                
                return (
                  <Card 
                    key={plano.id} 
                    className={cn(
                      "transition-all duration-200 border-l-4",
                      isPaid
                        ? "border-l-green-500 bg-green-50"
                        : isOverdue
                        ? "border-l-red-500 bg-red-50"
                        : "border-l-emerald-400 bg-gradient-to-r from-white to-emerald-50/30 hover:shadow-md"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {plano.clientName}
                            </h3>
                            <Badge className={cn(
                              isPaid 
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-emerald-100 text-emerald-800 border-emerald-200"
                            )}>
                              {plano.week}ª Semana
                            </Badge>
                            {isOverdue && !isPaid && (
                              <Badge variant="destructive">
                                {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrasado
                              </Badge>
                            )}
                            {isPaid && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                ✓ Pago
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-green-600">Valor:</span>
                              <span className="font-bold text-lg text-green-700">R$ {plano.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-orange-600">Vencimento:</span>
                              <span className="font-bold text-lg text-orange-700">{formatDate(plano.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handlePaymentToggle(plano.id, plano.clientName)}
                          className={cn(
                            "transition-all duration-300 ml-4",
                            isPaid
                              ? "bg-orange-500 hover:bg-orange-600 text-white"
                              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
                          )}
                        >
                          {isPaid ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Marcar Pendente
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Marcar como Pago
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default WeeklyPaymentButton;
