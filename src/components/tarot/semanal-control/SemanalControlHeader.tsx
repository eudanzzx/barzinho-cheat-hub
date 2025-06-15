
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface SemanalControlHeaderProps {
  paidCount: number;
  totalWeeks: number;
  paidValue: number;
  totalValue: number;
  diaVencimento?: string;
}

export const SemanalControlHeader: React.FC<SemanalControlHeaderProps> = ({
  paidCount,
  totalWeeks,
  paidValue,
  totalValue,
  diaVencimento,
}) => {
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
    
    return diaLabels[diaVencimento || 'sexta'] || 'sexta-feira';
  };

  return (
    <CardHeader className="bg-gray-50 border-b">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Calendar className="h-5 w-5" />
          Controle de Pagamentos Semanal - Vencimento toda {getDiaVencimentoLabel()}
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-2">
            {paidCount}/{totalWeeks}
          </Badge>
        </CardTitle>
        <div className="text-sm text-gray-600">
          R$ {paidValue.toFixed(2)} / R$ {totalValue.toFixed(2)}
        </div>
      </div>
    </CardHeader>
  );
};
