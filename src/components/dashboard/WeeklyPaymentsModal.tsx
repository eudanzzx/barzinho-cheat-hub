
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, X } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";

interface WeeklyPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WeeklyPaymentsModal: React.FC<WeeklyPaymentsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  
  const planos = getPlanos();
  const atendimentos = getAtendimentos();
  
  // Filtrar planos semanais ativos de clientes existentes
  const existingClientNames = new Set(atendimentos.map(a => a.nome));
  
  const activeWeeklyPlanos = planos.filter((plano): plano is PlanoSemanal => 
    plano.type === 'semanal' && 
    plano.active && 
    !plano.analysisId &&
    existingClientNames.has(plano.clientName)
  );

  const markAsPaid = (planoId: string, clientName: string) => {
    const updatedPlanos = planos.map(plano => 
      plano.id === planoId ? { ...plano, active: false } : plano
    );
    
    savePlanos(updatedPlanos);
    toast.success(`Pagamento de ${clientName} marcado como pago!`);
    
    // Dispatch event to update other components
    window.dispatchEvent(new Event('atendimentosUpdated'));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-800">
            <Calendar className="h-5 w-5" />
            Pagamentos Semanais Pendentes
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {activeWeeklyPlanos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum pagamento semanal pendente</p>
            </div>
          ) : (
            activeWeeklyPlanos.map((plano) => (
              <Card key={plano.id} className="border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {plano.clientName}
                        </h3>
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {plano.week}ª Semana
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Valor: R$ {plano.amount.toFixed(2)}</div>
                        <div>Vencimento: {formatDate(plano.dueDate)}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => markAsPaid(plano.id, plano.clientName)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Marcar como Pago
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyPaymentsModal;
