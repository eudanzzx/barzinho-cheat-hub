import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Check, X, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";
import { getNextWeekDays } from "@/utils/weekDayCalculator";
import { cn } from "@/lib/utils";

interface SemanalMonthsVisualizerProps {
  atendimento: {
    id: string;
    nome: string;
    semanalAtivo?: boolean;
    semanalData?: {
      semanas: string;
      valorSemanal: string;
      diaVencimento?: string;
    } | null;
    dataAtendimento: string;
    data?: string;
  };
}

interface SemanalWeek {
  week: number;
  isPaid: boolean;
  dueDate: string;
  semanalId?: string;
}

const SemanalMonthsVisualizer: React.FC<SemanalMonthsVisualizerProps> = ({ atendimento }) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [semanalWeeks, setSemanalWeeks] = useState<SemanalWeek[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Mudança: padrão fechado

  useEffect(() => {
    if (atendimento.semanalAtivo && atendimento.semanalData) {
      initializeSemanalWeeks();
    }
  }, [atendimento]);

  const initializeSemanalWeeks = () => {
    if (!atendimento.semanalData) {
      return;
    }

    let startDateString = atendimento.dataAtendimento;
    if (!startDateString || startDateString.trim() === '') {
      startDateString = atendimento.data || new Date().toISOString();
    }

    const startDate = new Date(startDateString);
    if (isNaN(startDate.getTime())) {
      console.error('Invalid date provided:', startDateString);
      toast.error('Data de atendimento inválida');
      return;
    }

    const totalWeeks = parseInt(atendimento.semanalData.semanas);
    if (isNaN(totalWeeks) || totalWeeks <= 0) {
      console.error('Invalid number of weeks:', atendimento.semanalData.semanas);
      toast.error('Número de semanas inválido');
      return;
    }

    const diaVencimento = atendimento.semanalData.diaVencimento || 'sexta';
    const weekDays = getNextWeekDays(totalWeeks, diaVencimento, startDate);
    const planos = getPlanos();
    
    const weeks: SemanalWeek[] = [];
    
    weekDays.forEach((weekDay, index) => {
      const semanalForWeek = planos.find((plano): plano is PlanoSemanal => 
        plano.id.startsWith(`${atendimento.id}-week-${index + 1}`) && plano.type === 'semanal'
      );
      
      weeks.push({
        week: index + 1,
        isPaid: semanalForWeek ? !semanalForWeek.active : false,
        dueDate: weekDay.toISOString().split('T')[0],
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
      const updatedPlanos = planos.map(plano => 
        plano.id === week.semanalId 
          ? { ...plano, active: !newIsPaid }
          : plano
      );
      savePlanos(updatedPlanos);
      
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].isPaid = newIsPaid;
      setSemanalWeeks(updatedWeeks);
    } else if (newIsPaid) {
      const newSemanal: PlanoSemanal = {
        id: `${atendimento.id}-week-${week.week}`,
        clientName: atendimento.nome,
        type: 'semanal',
        amount: parseFloat(atendimento.semanalData?.valorSemanal || '0'),
        dueDate: week.dueDate,
        week: week.week,
        totalWeeks: parseInt(atendimento.semanalData?.semanas || '0'),
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
    
    return diaLabels[atendimento.semanalData?.diaVencimento || 'sexta'] || 'sexta-feira';
  };

  if (!atendimento.semanalAtivo || !atendimento.semanalData) {
    return null;
  }

  const paidCount = semanalWeeks.filter(w => w.isPaid).length;

  return (
    <div className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10 hover:border-[#10B981] transition-colors duration-200 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Pagamentos Semanais ({paidCount}/{semanalWeeks.length})
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
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
                  R$ {(paidCount * parseFloat(atendimento.semanalData?.valorSemanal || '0')).toFixed(2)} / R$ {(semanalWeeks.length * parseFloat(atendimento.semanalData?.valorSemanal || '0')).toFixed(2)}
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SemanalMonthsVisualizer;
