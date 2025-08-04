import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";

interface AtendimentoWeeklyPaymentControlProps {
  atendimentoId: string;
  clientName: string;
  semanalData: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

const AtendimentoWeeklyPaymentControl: React.FC<AtendimentoWeeklyPaymentControlProps> = ({
  atendimentoId,
  clientName,
  semanalData,
  startDate,
}) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [planos, setPlanos] = useState<PlanoSemanal[]>([]);

  const loadPlanos = () => {
    const allPlanos = getPlanos();
    const filteredPlanos = allPlanos.filter(
      (plano) => plano.type === 'semanal' && plano.clientName === clientName
    ) as PlanoSemanal[];
    setPlanos(filteredPlanos);
  };

  useEffect(() => {
    loadPlanos();
    const handlePlanosUpdated = () => loadPlanos();
    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    return () => window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
  }, [clientName]);

  const togglePaymentStatus = (planoId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => {
      if (plano.id === planoId) {
        return { ...plano, active: !plano.active };
      }
      return plano;
    });
    
    savePlanos(updatedPlanos);
    loadPlanos();
    
    const plano = planos.find(p => p.id === planoId);
    if (plano) {
      toast.success(`Pagamento ${!plano.active ? 'marcado como pago' : 'marcado como pendente'}`);
    }
    
    window.dispatchEvent(new CustomEvent('atendimentosUpdated'));
  };

  const pendingCount = planos.filter(p => !p.active).length;
  const totalAmount = planos.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = planos.filter(p => !p.active).reduce((sum, p) => sum + p.amount, 0);

  if (planos.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-3">
          <p className="text-sm text-gray-600">Nenhum pagamento semanal encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header com estatísticas */}
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-green-700">
              Controle de Pagamentos Semanais
            </span>
            <Badge variant="outline" className="bg-white border-green-200 text-green-700">
              {pendingCount}/{planos.length} pendentes
            </Badge>
          </div>

          {/* Resumo financeiro */}
          <div className="bg-white/70 rounded-lg p-2 text-xs text-green-600">
            <div className="flex justify-between">
              <span>Pendente:</span>
              <span className="font-medium">R$ {pendingAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">R$ {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Lista de pagamentos */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  plano.active 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-green-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${
                    plano.active ? 'bg-green-100' : 'bg-green-100'
                  }`}>
                    <Calendar className={`h-3 w-3 ${
                      plano.active ? 'text-green-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-700">
                      {plano.week}ª Semana
                    </div>
                    <div className="text-xs text-gray-500">
                      R$ {plano.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => togglePaymentStatus(plano.id)}
                  className={`h-8 w-8 p-0 ${
                    plano.active
                      ? 'text-green-600 hover:bg-green-100'
                      : 'text-green-600 hover:bg-green-100'
                  }`}
                >
                  {plano.active ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AtendimentoWeeklyPaymentControl;