
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";
import { getNextWeekDays } from "@/utils/weekDayCalculator";

interface TarotWeeklyPaymentControlProps {
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
  planoId?: string;
}

const TarotWeeklyPaymentControl: React.FC<TarotWeeklyPaymentControlProps> = ({
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

  useEffect(() => {
    const handlePlanosUpdated = () => {
      initializeSemanalWeeks();
    };

    window.addEventListener('planosUpdated', handlePlanosUpdated);
    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('planosUpdated', handlePlanosUpdated);
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
    };
  }, []);

  const initializeSemanalWeeks = () => {
    const totalWeeks = parseInt(semanalData.semanas);
    const diaVencimento = semanalData.diaVencimento || 'sexta';
    
    console.log('🔍 TarotWeeklyPaymentControl - Inicializando:', {
      analysisId,
      totalWeeks,
      diaVencimento,
      startDate: startDate,
      clientName
    });
    
    // Usar getNextWeekDays para calcular as datas corretas - igual aos próximos vencimentos
    const weekDays = getNextWeekDays(totalWeeks, diaVencimento, new Date(startDate));
    
    console.log('🔍 TarotWeeklyPaymentControl - Datas calculadas pelo weekDayCalculator:', 
      weekDays.map((date, index) => ({
        week: index + 1,
        date: date.toISOString().split('T')[0],
        dateObject: date.toDateString(),
        dayOfWeek: date.getDay(),
        dayName: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][date.getDay()]
      }))
    );
    
    const planos = getPlanos();
    const weeks: SemanalWeek[] = [];
    
    // Usar as datas calculadas corretamente pelo weekDayCalculator
    weekDays.forEach((weekDay, index) => {
      const week = index + 1;
      const correctDueDate = weekDay.toISOString().split('T')[0];
      
      const existingPlano = planos.find((plano): plano is PlanoSemanal => 
        plano.type === 'semanal' && 
        (plano.analysisId === analysisId || 
         (plano.clientName === clientName && plano.week === week)) &&
        plano.week === week
      );

      weeks.push({
        week: week,
        isPaid: existingPlano ? !existingPlano.active : false,
        dueDate: correctDueDate, // Usar a data calculada corretamente
        planoId: existingPlano?.id,
      });
    });
    
    console.log('✅ TarotWeeklyPaymentControl - Semanas inicializadas com datas corretas:', {
      totalWeeks: weeks.length,
      paidWeeks: weeks.filter(w => w.isPaid).length,
      datesGenerated: weeks.map(w => ({ week: w.week, dueDate: w.dueDate }))
    });
    
    setSemanalWeeks(weeks);
  };

  const handlePaymentToggle = (weekIndex: number) => {
    const week = semanalWeeks[weekIndex];
    const planos = getPlanos();
    const newIsPaid = !week.isPaid;

    if (week.planoId) {
      const updatedPlanos = planos.map(plano =>
        plano.id === week.planoId
          ? { ...plano, active: !newIsPaid }
          : plano
      );

      savePlanos(updatedPlanos);

      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].isPaid = newIsPaid;
      setSemanalWeeks(updatedWeeks);
    } else if (newIsPaid) {
      const newPlano: PlanoSemanal = {
        id: `semanal-${Date.now()}-${Math.random()}`,
        type: 'semanal',
        clientName,
        week: week.week,
        totalWeeks: parseInt(semanalData.semanas),
        amount: parseFloat(semanalData.valorSemanal),
        dueDate: week.dueDate,
        active: false,
        analysisId,
        created: new Date().toISOString(),
      };

      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);

      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].planoId = newPlano.id;
      updatedWeeks[weekIndex].isPaid = true;
      setSemanalWeeks(updatedWeeks);
    }

    setTimeout(() => {
      window.dispatchEvent(new Event('planosUpdated'));
    }, 100);

    toast.success(
      newIsPaid
        ? `Semana ${week.week} marcada como paga`
        : `Semana ${week.week} marcada como pendente`
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

  const paidCount = semanalWeeks.filter(w => w.isPaid).length;
  const totalValue = semanalWeeks.length * parseFloat(semanalData.valorSemanal);
  const paidValue = paidCount * parseFloat(semanalData.valorSemanal);

  return (
    <Card className="border-emerald-200 bg-emerald-50/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <span className="font-medium text-emerald-800">Controle de Pagamentos Semanais</span>
          <Badge 
            variant="secondary" 
            className="bg-emerald-100 text-emerald-800"
          >
            {paidCount}/{semanalWeeks.length}
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
          {semanalWeeks.map((week, index) => {
            const isPaid = week.isPaid;
            return (
              <Button
                key={week.week}
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
                      {week.week}ª Semana
                    </div>
                    <div className="text-sm opacity-75">
                      Vencimento: {formatDate(week.dueDate)}
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

export default TarotWeeklyPaymentControl;
