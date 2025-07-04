
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, X } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";
import { cn } from "@/lib/utils";

interface MonthlyPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonthlyPaymentsModal: React.FC<MonthlyPaymentsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [allPlanos, setAllPlanos] = useState<PlanoMensal[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      loadAllPlanos();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      if (isOpen) {
        loadAllPlanos();
      }
    };

    window.addEventListener('planosUpdated', handleUpdate);
    window.addEventListener('monthlyPaymentsUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('planosUpdated', handleUpdate);
      window.removeEventListener('monthlyPaymentsUpdated', handleUpdate);
    };
  }, [isOpen]);

  const loadAllPlanos = () => {
    const planos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    // TODOS os planos mensais - pagos e pendentes
    const monthlyPlanos = planos.filter((plano): plano is PlanoMensal => 
      plano.type === 'plano' && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );

    setAllPlanos(monthlyPlanos);
  };

  const handlePaymentToggle = (planoId: string, clientName: string) => {
    const planos = getPlanos();
    const planoAtual = planos.find(p => p.id === planoId);
    
    if (!planoAtual) return;
    
    const updatedPlanos = planos.map(plano => 
      plano.id === planoId ? { ...plano, active: !plano.active } : plano
    );
    
    savePlanos(updatedPlanos);
    toast.success(
      planoAtual.active 
        ? `Pagamento de ${clientName} marcado como pago!`
        : `Pagamento de ${clientName} marcado como pendente!`
    );
    
    setTimeout(() => {
      window.dispatchEvent(new Event('planosUpdated'));
      window.dispatchEvent(new Event('monthlyPaymentsUpdated'));
    }, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-800">
            <CreditCard className="h-5 w-5" />
            Controle de Pagamentos Mensais
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {allPlanos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum plano mensal encontrado</p>
            </div>
          ) : (
            allPlanos.map((plano) => {
              const isPaid = !plano.active;
              
              return (
                <Card 
                  key={plano.id} 
                  className={cn(
                    "border-l-4 transition-all duration-200",
                    isPaid 
                      ? "border-l-green-500 bg-green-50" 
                      : "border-l-red-500 bg-red-50"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {plano.clientName}
                          </h3>
                          <Badge className={cn(
                            isPaid 
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          )}>
                            {plano.month}º Mês
                          </Badge>
                          {isPaid && (
                            <Badge className="bg-green-100 text-green-800">
                              ✓ Pago
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Valor: R$ {plano.amount.toFixed(2)}</div>
                          <div>Vencimento: {formatDate(plano.dueDate)}</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePaymentToggle(plano.id, plano.clientName)}
                        className={cn(
                          isPaid
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
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
      </DialogContent>
    </Dialog>
  );
};

export default MonthlyPaymentsModal;
