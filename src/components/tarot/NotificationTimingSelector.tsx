
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, Check } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";

interface NotificationTimingSelectorProps {
  planId: string;
  currentTiming?: 'on_due_date' | 'next_week' | '1_day_before' | '2_days_before' | '3_days_before' | '7_days_before';
  onTimingChange?: (timing: 'on_due_date' | 'next_week' | '1_day_before' | '2_days_before' | '3_days_before' | '7_days_before') => void;
}

const NotificationTimingSelector: React.FC<NotificationTimingSelectorProps> = ({
  planId,
  currentTiming = 'on_due_date',
  onTimingChange
}) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [selectedTiming, setSelectedTiming] = useState<'on_due_date' | 'next_week' | '1_day_before' | '2_days_before' | '3_days_before' | '7_days_before'>(currentTiming);

  const handleTimingChange = (timing: 'on_due_date' | 'next_week' | '1_day_before' | '2_days_before' | '3_days_before' | '7_days_before') => {
    const planos = getPlanos();
    const updatedPlanos = planos.map(plano => 
      plano.id === planId 
        ? { ...plano, notificationTiming: timing }
        : plano
    );
    
    savePlanos(updatedPlanos);
    setSelectedTiming(timing);
    
    if (onTimingChange) {
      onTimingChange(timing);
    }
    
    const timingTexts = {
      'on_due_date': 'no dia do vencimento',
      'next_week': 'na próxima semana',
      '1_day_before': '1 dia antes do vencimento',
      '2_days_before': '2 dias antes do vencimento',
      '3_days_before': '3 dias antes do vencimento',
      '7_days_before': '7 dias antes do vencimento'
    };
    
    toast.success(`Notificação configurada para ${timingTexts[timing]}`);
  };

  const notificationOptions = [
    {
      value: 'on_due_date',
      label: 'No dia do vencimento',
      description: 'Receber notificação exatamente no dia que o pagamento vence',
      color: 'blue'
    },
    {
      value: '1_day_before',
      label: '1 dia antes',
      description: 'Receber notificação 1 dia antes do vencimento',
      color: 'green'
    },
    {
      value: '2_days_before',
      label: '2 dias antes',
      description: 'Receber notificação 2 dias antes do vencimento',
      color: 'yellow'
    },
    {
      value: '3_days_before',
      label: '3 dias antes',
      description: 'Receber notificação 3 dias antes do vencimento',
      color: 'orange'
    },
    {
      value: '7_days_before',
      label: '7 dias antes',
      description: 'Receber notificação 1 semana antes do vencimento',
      color: 'purple'
    },
    {
      value: 'next_week',
      label: 'Na próxima semana',
      description: 'Receber notificação apenas na próxima data de vencimento',
      color: 'red'
    }
  ];

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
          <Bell className="h-4 w-4" />
          Configuração de Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Escolha quando deseja receber a notificação de pagamento:
          </p>
          
          <div className="grid grid-cols-1 gap-2">
            {notificationOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                onClick={() => handleTimingChange(option.value as any)}
                className={`h-auto p-3 flex items-start gap-3 transition-all duration-200 ${
                  selectedTiming === option.value
                    ? `border-${option.color}-500 bg-${option.color}-100 text-${option.color}-700`
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className={`
                  mt-0.5 p-1.5 rounded-full transition-colors duration-200
                  ${selectedTiming === option.value 
                    ? `bg-${option.color}-500 text-white` 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {selectedTiming === option.value ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Calendar className="h-3 w-3" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-slate-500">
                    {option.description}
                  </div>
                </div>
                {selectedTiming === option.value && (
                  <Badge variant="secondary" className={`bg-${option.color}-200 text-${option.color}-800 text-xs`}>
                    Ativo
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTimingSelector;
