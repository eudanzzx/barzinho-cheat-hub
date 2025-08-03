
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface SemanalWeek {
  week: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  semanalId?: string;
}

interface SemanalWeekButtonProps {
  week: SemanalWeek;
  index: number;
  onToggle: (index: number) => void;
}

export const SemanalWeekButton: React.FC<SemanalWeekButtonProps> = ({
  week,
  index,
  onToggle,
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Se já está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
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

  return (
    <Button
      onClick={() => onToggle(index)}
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
  );
};
