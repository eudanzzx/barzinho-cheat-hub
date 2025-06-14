
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, CreditCard } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";

interface PlanoPaymentControlProps {
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

const PlanoPaymentControl: React.FC<PlanoPaymentControlProps> = ({
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
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
      const actualDueDay = Math.min(dueDay, lastDayOfMonth);
      dueDate.setDate(actualDueDay);
      
      const planoForMonth = planos.find((plano) => 
        plano.clientName === clientName && 
        plano.type === 'plano' &&
        'month' in plano &&
        plano.month === i && 
        'totalMonths' in plano &&
        plano.totalMonths === totalMonths
      );
      
      months.push({
        month: i,
        isPaid: planoForMonth ? !planoForMonth.active : false,
        dueDate: dueDate.toISOString().split('T')[0],
        paymentDate: planoForMonth?.created ? new Date(planoForMonth.created).toISOString().split('T')[0] : undefined,
        planoId: planoForMonth?.id
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
      const newPlano = {
        id: `${analysisId}-month-${month.month}`,
        clientName: clientName,
        type: 'plano' as const,
        amount: parseFloat(planoData.valorMensal),
        dueDate: month.dueDate,
        month: month.month,
        totalMonths: parseInt(planoData.meses),
        created: new Date().toISOString(),
        active: false,
        notificationTiming: 'on_due_date' as const
      };
      
      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);
      
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      updatedMonths[monthIndex].isPaid = true;
      setPlanoMonths(updatedMonths);
    } else {
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = false;
      setPlanoMonths(updatedMonths);
    }
    
    toast.success(
      newIsPaid 
        ? `Mês ${month.month} marcado como pago` 
        : `Mês ${month.month} marcado como pendente`
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const paidCount = planoMonths.filter(m => m.isPaid).length;
  const totalValue = planoMonths.length * parseFloat(planoData.valorMensal);
  const paidValue = paidCount * parseFloat(planoData.valorMensal);

  const getDiaVencimentoDisplay = () => {
    if (planoData.diaVencimento) {
      const parsedDay = parseInt(planoData.diaVencimento);
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        return `dia ${parsedDay}`;
      }
    }
    return 'dia 5 (padrão)';
  };

  return (
    <Card className="mt-4 border-gray-200">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <CreditCard className="h-5 w-5" />
            Controle de Pagamentos Mensal - Vencimento todo {getDiaVencimentoDisplay()}
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-2">
              {paidCount}/{planoMonths.length}
            </Badge>
          </CardTitle>
          <div className="text-sm text-gray-600">
            R$ {paidValue.toFixed(2)} / R$ {totalValue.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {planoMonths.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Carregando meses do plano...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {planoMonths.map((month, index) => (
              <Button
                key={month.month}
                onClick={() => handlePaymentToggle(index)}
                variant="outline"
                className={`
                  w-full p-4 h-auto flex items-center justify-between
                  ${month.isPaid 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full ${month.isPaid ? 'bg-green-200' : 'bg-red-200'}`}>
                    {month.isPaid ? (
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
                <Badge variant={month.isPaid ? "default" : "destructive"}>
                  {month.isPaid ? 'Pago' : 'Pendente'}
                </Badge>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanoPaymentControl;
