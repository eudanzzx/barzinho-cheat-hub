import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Check, X, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";
import { cn } from "@/lib/utils";

interface PlanoMonthsVisualizerProps {
  atendimento: {
    id: string;
    nome: string;
    planoAtivo?: boolean;
    planoData?: {
      meses: string;
      valorMensal: string;
      diaVencimento?: string;
    } | null;
    dataAtendimento: string;
    data?: string;
  };
}

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  planoId?: string;
}

const PlanoMonthsVisualizer: React.FC<PlanoMonthsVisualizerProps> = ({ atendimento }) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [planoMonths, setPlanoMonths] = useState<PlanoMonth[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Mudança: padrão fechado

  useEffect(() => {
    if (atendimento.planoAtivo && atendimento.planoData) {
      initializePlanoMonths();
    }
  }, [atendimento]);

  const initializePlanoMonths = () => {
    if (!atendimento.planoData) {
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

    const totalMonths = parseInt(atendimento.planoData.meses);
    if (isNaN(totalMonths) || totalMonths <= 0) {
      console.error('Invalid number of months:', atendimento.planoData.meses);
      toast.error('Número de meses inválido');
      return;
    }

    let dueDay = 5;
    if (atendimento.planoData.diaVencimento) {
      const parsedDay = parseInt(atendimento.planoData.diaVencimento);
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        dueDay = parsedDay;
      }
    }

    const planos = getPlanos();
    const months: PlanoMonth[] = [];
    
    for (let i = 1; i <= totalMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
      const actualDueDay = Math.min(dueDay, lastDayOfMonth);
      dueDate.setDate(actualDueDay);
      
      if (isNaN(dueDate.getTime())) {
        console.error('Invalid due date created for month', i);
        continue;
      }
      
      const planoForMonth = planos.find((plano): plano is PlanoMensal => 
        plano.clientName === atendimento.nome && 
        plano.type === 'plano' &&
        'month' in plano &&
        plano.month === i && 
        plano.totalMonths === totalMonths
      );
      
      months.push({
        month: i,
        isPaid: planoForMonth ? !planoForMonth.active : false,
        dueDate: dueDate.toISOString().split('T')[0],
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
      const newPlano: PlanoMensal = {
        id: `${Date.now()}-${monthIndex}`,
        clientName: atendimento.nome,
        type: 'plano',
        amount: parseFloat(atendimento.planoData?.valorMensal || '0'),
        dueDate: month.dueDate,
        month: month.month,
        totalMonths: parseInt(atendimento.planoData?.meses || '0'),
        created: new Date().toISOString(),
        active: false,
        notificationTiming: 'on_due_date'
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

  const getDiaVencimentoDisplay = () => {
    if (atendimento.planoData?.diaVencimento) {
      const parsedDay = parseInt(atendimento.planoData.diaVencimento);
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        return `dia ${parsedDay}`;
      }
    }
    return 'dia 5 (padrão)';
  };

  if (!atendimento.planoAtivo || !atendimento.planoData) {
    return null;
  }

  const paidCount = planoMonths.filter(m => m.isPaid).length;

  return (
    <div className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-colors duration-200 flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Pagamentos Mensais ({paidCount}/{planoMonths.length})
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
                  <CreditCard className="h-5 w-5" />
                  Controle de Pagamentos Mensal - Vencimento todo {getDiaVencimentoDisplay()}
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-2">
                    {paidCount}/{planoMonths.length}
                  </Badge>
                </CardTitle>
                <div className="text-sm text-gray-600">
                  R$ {(paidCount * parseFloat(atendimento.planoData?.valorMensal || '0')).toFixed(2)} / R$ {(planoMonths.length * parseFloat(atendimento.planoData?.valorMensal || '0')).toFixed(2)}
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PlanoMonthsVisualizer;
