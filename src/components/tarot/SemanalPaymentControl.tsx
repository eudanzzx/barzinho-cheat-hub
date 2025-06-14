
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";
import { getNextWeekDays } from "@/utils/weekDayCalculator";

interface SemanalPaymentControlProps {
  analysisId: string;
  clientName: string;
  semanalData: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

interface SemanalWeek {
  week: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  semanalId?: string;
}

const SemanalPaymentControl: React.FC<SemanalPaymentControlProps> = ({
  analysisId,
  clientName,
  semanalData,
  startDate,
}) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [semanalWeeks, setSemanalWeeks] = useState<SemanalWeek[]>([]);

  useEffect(() => {
    initializeSemanalWeeks();
  }, [analysisId, semanalData, startDate]);

  const initializeSemanalWeeks = () => {
    const totalWeeks = parseInt(semanalData.semanas);
    const diaVencimento = semanalData.diaVencimento || 'sexta';
    
    const weekDays = getNextWeekDays(totalWeeks, diaVencimento, new Date(startDate));
    const planos = getPlanos();
    
    const weeks: SemanalWeek[] = [];
    
    weekDays.forEach((weekDay, index) => {
      const semanalForWeek = planos.find((plano): plano is PlanoSemanal => 
        plano.id.startsWith(`${analysisId}-week-${index + 1}`) && plano.type === 'semanal'
      );
      
      weeks.push({
        week: index + 1,
        isPaid: semanalForWeek ? !semanalForWeek.active : false,
        dueDate: weekDay.toISOString().split('T')[0],
        paymentDate: semanalForWeek?.created ? new Date(semanalForWeek.created).toISOString().split('T')[0] : undefined,
        semanalId: semanalForWeek?.id
      });
    });
    
    setSemanalWeeks(weeks);
  };

  const handlePaymentToggle = (weekIndex: number) => {
    const week = semanalWeeks[weekIndex];
    const planos = getPlanos();
    
    const newIsPaid = !week.isPaid;
    
    if (week.semanalId) {
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].isPaid = newIsPaid;
      setSemanalWeeks(updatedWeeks);
    } else if (newIsPaid) {
      const newSemanal: PlanoSemanal = {
        id: `${analysisId}-week-${week.week}`,
        clientName: clientName,
        type: 'semanal',
        amount: parseFloat(semanalData.valorSemanal),
        dueDate: week.dueDate,
        week: week.week,
        totalWeeks: parseInt(semanalData.semanas),
        created: new Date().toISOString(),
        active: false,
        notificationTiming: 'on_due_date'
      };
      
      const updatedPlanos = [...planos, newSemanal];
      savePlanos(updatedPlanos);
      
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].semanalId = newSemanal.id;
      updatedWeeks[weekIndex].isPaid = true;
      setSemanalWeeks(updatedWeeks);
    } else {
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].isPaid = false;
      setSemanalWeeks(updatedWeeks);
    }
    
    toast.success(
      newIsPaid 
        ? `Semana ${week.week} marcada como paga` 
        : `Semana ${week.week} marcada como pendente`
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const paidCount = semanalWeeks.filter(w => w.isPaid).length;
  const totalValue = semanalWeeks.length * parseFloat(semanalData.valorSemanal);
  const paidValue = paidCount * parseFloat(semanalData.valorSemanal);

  const getDiaVencimentoLabel = () => {
    const diaLabels: { [key: string]: string } = {
      'segunda': 'segunda-feira',
      'terca': 'terça-feira',
      'quarta': 'quarta-feira', 
      'quinta': 'quinta-feira',
      'sexta': 'sexta-feira',
      'sabado': 'sábado',
      'domingo': 'domingo'
    };
    
    return diaLabels[semanalData.diaVencimento || 'sexta'] || 'sexta-feira';
  };

  return (
    <Card className="mt-4 border-gray-200">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Calendar className="h-5 w-5" />
            Controle de Pagamentos Semanal - Vencimento toda {getDiaVencimentoLabel()}
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-2">
              {paidCount}/{semanalWeeks.length}
            </Badge>
          </CardTitle>
          <div className="text-sm text-gray-600">
            R$ {paidValue.toFixed(2)} / R$ {totalValue.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {semanalWeeks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Carregando semanas...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {semanalWeeks.map((week, index) => (
              <Button
                key={week.week}
                onClick={() => handlePaymentToggle(index)}
                variant="outline"
                className={`
                  w-full p-4 h-auto flex items-center justify-between
                  ${week.isPaid 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full ${week.isPaid ? 'bg-green-200' : 'bg-red-200'}`}>
                    {week.isPaid ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">
                      {week.week}ª Semana
                    </div>
                    <div className="text-sm opacity-75">
                      Vencimento: {formatDate(week.dueDate)}
                    </div>
                  </div>
                </div>
                <Badge variant={week.isPaid ? "default" : "destructive"}>
                  {week.isPaid ? 'Pago' : 'Pendente'}
                </Badge>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SemanalPaymentControl;
