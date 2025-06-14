
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";

const MonthlyPaymentButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  
  const [planos, setPlanos] = useState<PlanoMensal[]>([]);

  console.log("MonthlyPaymentButton - Componente renderizado", { isOpen });

  useEffect(() => {
    loadPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      console.log("MonthlyPaymentButton - Evento atendimentosUpdated recebido");
      loadPlanos();
    };

    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
    };
  }, []);

  const loadPlanos = () => {
    console.log("MonthlyPaymentButton - Carregando planos...");
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    const activeMonthlyPlanos = allPlanos.filter((plano): plano is PlanoMensal => 
      plano.type === 'plano' && 
      plano.active && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );

    console.log("MonthlyPaymentButton - Planos carregados:", { 
      total: allPlanos.length, 
      mensais: activeMonthlyPlanos.length,
      activeMonthlyPlanos 
    });

    setPlanos(activeMonthlyPlanos);
  };

  const markAsPaid = (planoId: string, clientName: string) => {
    console.log("MonthlyPaymentButton - Marcando como pago:", { planoId, clientName });
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === planoId ? { ...plano, active: false } : plano
    );
    
    savePlanos(updatedPlanos);
    toast.success(`Pagamento de ${clientName} marcado como pago!`);
    
    // Dispatch event to update other components
    window.dispatchEvent(new Event('atendimentosUpdated'));
    loadPlanos();
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

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 border-2",
        isOpen 
          ? "border-purple-400 bg-gradient-to-br from-purple-50 to-violet-50 shadow-lg" 
          : "border-purple-200 bg-white hover:border-purple-300 hover:shadow-md"
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-purple-700">
            <div className="p-2 rounded-full bg-purple-100">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pagamentos Mensais</h3>
              <p className="text-sm text-purple-600 font-normal">
                {planos.length} pagamento(s) pendente(s)
              </p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-purple-100 text-purple-800 border-purple-200"
            >
              {planos.length}
            </Badge>
            <ChevronDown className={cn(
              "h-5 w-5 text-purple-600 transition-transform duration-300",
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
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum pagamento mensal pendente</p>
              </div>
            ) : (
              planos.map((plano) => {
                const daysOverdue = getDaysOverdue(plano.dueDate);
                const isOverdue = daysOverdue > 0;
                
                return (
                  <Card 
                    key={plano.id} 
                    className={cn(
                      "transition-all duration-200 border-l-4",
                      isOverdue
                        ? "border-l-red-500 bg-red-50"
                        : "border-l-purple-400 bg-gradient-to-r from-white to-purple-50/30 hover:shadow-md"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {plano.clientName}
                            </h3>
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              {plano.month}º Mês
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive">
                                {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrasado
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
                          onClick={() => markAsPaid(plano.id, plano.clientName)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ml-4"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Marcar como Pago
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
