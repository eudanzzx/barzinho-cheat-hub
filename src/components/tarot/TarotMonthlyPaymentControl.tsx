
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";

interface TarotMonthlyPaymentControlProps {
  analysisId: string;
  clientName: string;
  planoData: {
    meses: string;
    valorMensal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  planoId?: string;
}

const TarotMonthlyPaymentControl: React.FC<TarotMonthlyPaymentControlProps> = ({
  analysisId,
  clientName,
  planoData,
  startDate,
}) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [planoMonths, setPlanoMonths] = useState<PlanoMonth[]>([]);

  useEffect(() => {
    initializePlanoMonths();
  }, [analysisId, planoData, startDate]);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      initializePlanoMonths();
    };

    window.addEventListener('planosUpdated', handlePlanosUpdated);
    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('planosUpdated', handlePlanosUpdated);
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
    };
  }, []);

  const initializePlanoMonths = () => {
    const totalMonths = parseInt(planoData.meses);
    const baseDate = new Date(startDate);
    const planos = getPlanos();
    
    let dueDay = 5;
    if (planoData.diaVencimento) {
      const parsedDay = parseInt(planoData.diaVencimento);
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        dueDay = parsedDay;
      }
    }

    const months: PlanoMonth[] = [];
    
    for (let i = 1; i <= totalMonths; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(baseDate.getMonth() + i - 1);
      
      const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
      const correctedDueDay = Math.min(dueDay, lastDayOfMonth);
      dueDate.setDate(correctedDueDay);
      
      const existingPlano = planos.find((plano): plano is PlanoMensal => 
        plano.type === 'plano' && 
        plano.analysisId === analysisId && 
        plano.month === i
      );

      months.push({
        month: i,
        isPaid: existingPlano ? !existingPlano.active : false,
        dueDate: dueDate.toISOString().split('T')[0],
        planoId: existingPlano?.id,
      });
    }
    
    setPlanoMonths(months);
  };

  const handlePaymentToggle = (monthIndex: number) => {
    const month = planoMonths[monthIndex];
    const planos = getPlanos();
    const newIsPaid = !month.isPaid;

    if (month.planoId) {
      const updatedPlanos = planos.map(plano =>
        plano.id === month.planoId
          ? { ...plano, active: !newIsPaid }
          : plano
      );

      savePlanos(updatedPlanos);

      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = newIsPaid;
      setPlanoMonths(updatedMonths);
    } else if (newIsPaid) {
      const newPlano: PlanoMensal = {
        id: `plano-${Date.now()}-${Math.random()}`,
        type: 'plano',
        clientName,
        month: month.month,
        totalMonths: parseInt(planoData.meses),
        amount: parseFloat(planoData.valorMensal),
        dueDate: month.dueDate,
        active: false,
        analysisId,
        created: new Date().toISOString(),
      };

      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);

      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      updatedMonths[monthIndex].isPaid = true;
      setPlanoMonths(updatedMonths);
    }

    setTimeout(() => {
      window.dispatchEvent(new Event('planosUpdated'));
    }, 100);

    toast.success(
      newIsPaid
        ? `Mês ${month.month} marcado como pago`
        : `Mês ${month.month} marcado como pendente`
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Se já está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Para outros formatos, tenta conversão normal
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const paidCount = planoMonths.filter(m => m.isPaid).length;
  const totalValue = planoMonths.length * parseFloat(planoData.valorMensal);
  const paidValue = paidCount * parseFloat(planoData.valorMensal);

  return (
    <Card className="border-blue-200 bg-blue-50/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Controle de Pagamentos Mensais</span>
          <Badge 
            variant="secondary" 
            className="bg-blue-100 text-blue-800"
          >
            {paidCount}/{planoMonths.length}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span>Pago: R$ {paidValue.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <span>Total: R$ {totalValue.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {planoMonths.map((month, index) => {
            const isPaid = month.isPaid;
            return (
              <Button
                key={month.month}
                onClick={() => handlePaymentToggle(index)}
                variant="outline"
                className={`
                  w-full p-4 h-auto flex items-center justify-between
                  ${isPaid 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full ${isPaid ? 'bg-green-200' : 'bg-red-200'}`}>
                    {isPaid ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">
                      {month.month}º Mês
                    </div>
                    <div className="text-sm opacity-75">
                      Vencimento: {formatDate(month.dueDate)}
                    </div>
                  </div>
                </div>
                <Badge variant={isPaid ? "default" : "destructive"}>
                  {isPaid ? 'Pago' : 'Pendente'}
                </Badge>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TarotMonthlyPaymentControl;
