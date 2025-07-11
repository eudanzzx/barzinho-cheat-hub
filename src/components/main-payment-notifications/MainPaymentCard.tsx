
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

interface MainPaymentCardProps {
  payment: PlanoMensal | PlanoSemanal;
  isAdditional?: boolean;
  onViewDetails?: (payment: any) => void;
}

export const MainPaymentCard: React.FC<MainPaymentCardProps> = ({ payment, isAdditional = false, onViewDetails }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    };
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(payment.dueDate);
  const formattedDate = formatDate(payment.dueDate);

  function getUrgencyText(daysUntilDue: number) {
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} ${Math.abs(daysUntilDue) === 1 ? 'dia' : 'dias'} em atraso`;
    if (daysUntilDue === 0) return 'Vence hoje';
    if (daysUntilDue === 1) return 'Vence amanhã';
    return `${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'} restantes`;
  }

  return (
    <div className={`rounded-xl border border-[#60a5fa] bg-[#eff6ff] shadow-sm p-4 transition-all duration-200 relative 
      ${isAdditional ? 'ml-4 mt-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="border-transparent bg-white/60 text-[#0ea5e9] font-semibold px-3 py-1 text-xs"
            style={{ boxShadow: 'none' }}
          >
            {payment.type === "plano" ? "Mensal" : "Semanal"}
          </Badge>
        </div>
        <span className="text-lg font-bold text-green-600">
          R$ {payment.amount.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-[#0ea5e9] font-medium mb-1 mt-1">
        <Calendar className="h-4 w-4" />
        <span>
          {formattedDate.date} às {formattedDate.time}
        </span>
      </div>
      <div className="text-sm mt-0.5 font-medium text-[#0284c7] mb-1">
        {getUrgencyText(daysUntilDue)}
      </div>
      {onViewDetails && (
        <div className="mt-3 flex justify-end">
          <Button
            onClick={() => onViewDetails(payment)}
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-3 py-1.5 h-7"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver detalhes
          </Button>
        </div>
      )}
    </div>
  );
};
