
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";

const MonthlyPaymentButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  
  const [allPlanos, setAllPlanos] = useState<PlanoMensal[]>([]);

  console.log("MonthlyPaymentButton - Renderizado", { isOpen, totalPlanos: allPlanos.length });

  useEffect(() => {
    loadAllPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      console.log("MonthlyPaymentButton - Evento recebido, recarregando...");
      loadAllPlanos();
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

  const loadAllPlanos = () => {
    console.log("MonthlyPaymentButton - Carregando TODOS os planos mensais...");
    const todosPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    // TODOS OS PLANOS MENSAIS - PAGOS E PENDENTES
    const planosRelevantes = todosPlanos.filter((plano): plano is PlanoMensal => 
      plano.type === 'plano' && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );

    console.log("MonthlyPaymentButton - Planos encontrados:", planosRelevantes.length);
    console.log("MonthlyPaymentButton - Detalhes:", planosRelevantes.map(p => ({ 
      id: p.id, 
      client: p.clientName, 
      active: p.active,
      isPaid: !p.active,
      month: p.month 
    })));

    setAllPlanos(planosRelevantes);
  };

  const handlePaymentToggle = (planoId: string, clientName: string) => {
    console.log("MonthlyPaymentButton - Toggle pagamento:", { planoId, clientName });
    const todosPlanos = getPlanos();
    const planoAtual = todosPlanos.find(p => p.id === planoId);
    
    if (!planoAtual) return;
    
    const novoStatus = !planoAtual.active; // Inverte o status
    
    const updatedPlanos = todosPlanos.map(plano => 
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
      loadAllPlanos();
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

  const pendingPlanos = allPlanos.filter(p => p.active);

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 border-2",
        isOpen 
          ? "border-blue-400 bg-gradient-to-br from-blue-50 to-sky-50 shadow-lg" 
          : "border-blue-200 bg-white hover:border-blue-300 hover:shadow-md"
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-blue-700">
            <div className="p-2 rounded-full bg-blue-100">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pagamentos Mensais</h3>
              <p className="text-sm text-blue-600 font-normal">
                {allPlanos.length} total | {pendingPlanos.length} pendente(s)
              </p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              {allPlanos.length}
            </Badge>
            <ChevronDown className={cn(
              "h-5 w-5 text-blue-600 transition-transform duration-300",
              isOpen && "rotate-180"
            )} />
          </div>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-3 mt-4">
            {allPlanos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum plano mensal encontrado</p>
              </div>
            ) : (
              allPlanos.map((plano) => {
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
                        : "border-l-blue-400 bg-gradient-to-r from-white to-blue-50/30 hover:shadow-md"
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
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            )}>
                              {plano.month}º Mês
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

export default MonthlyPaymentButton;
