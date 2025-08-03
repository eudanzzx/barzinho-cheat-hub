
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  planoId?: string;
}

interface PlanoMonthButtonProps {
  month: PlanoMonth;
  index: number;
  onToggle: (index: number) => void;
}

export const PlanoMonthButton: React.FC<PlanoMonthButtonProps> = ({
  month,
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
      return date.toLocaleDateString('pt-BR');
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
  );
};
