
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

interface PlanoControlHeaderProps {
  paidCount: number;
  totalMonths: number;
  paidValue: number;
  totalValue: number;
  diaVencimento?: string;
}

export const PlanoControlHeader: React.FC<PlanoControlHeaderProps> = ({
  paidCount,
  totalMonths,
  paidValue,
  totalValue,
  diaVencimento,
}) => {
  const getDiaVencimentoDisplay = () => {
    if (diaVencimento) {
      const parsedDay = parseInt(diaVencimento);
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        return `dia ${parsedDay}`;
      }
    }
    return 'dia 5 (padrão)';
  };

  return (
    <CardHeader className="bg-gray-50 border-b">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <CreditCard className="h-5 w-5" />
          Controle de Pagamentos Mensal - Vencimento todo {getDiaVencimentoDisplay()}
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-2">
            {paidCount}/{totalMonths}
          </Badge>
        </CardTitle>
        <div className="text-sm text-gray-600">
          R$ {paidValue.toFixed(2)} / R$ {totalValue.toFixed(2)}
        </div>
      </div>
    </CardHeader>
  );
};
