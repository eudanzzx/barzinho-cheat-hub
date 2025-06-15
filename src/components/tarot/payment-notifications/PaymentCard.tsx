
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard } from "lucide-react";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

interface PaymentCardProps {
  payment: PlanoMensal | PlanoSemanal;
  isAdditional?: boolean;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment, isAdditional = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
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

  const getUrgencyLevel = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue === 0) return 'today';
    if (daysUntilDue <= 1) return 'urgent';
    if (daysUntilDue <= 3) return 'warning';
    return 'normal';
  };

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'today': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'urgent': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-purple-600 bg-purple-50 border-purple-200';
    }
  };

  const getUrgencyText = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} ${Math.abs(daysUntilDue) === 1 ? 'dia' : 'dias'} em atraso`;
    if (daysUntilDue === 0) return 'Vence hoje';
    if (daysUntilDue === 1) return 'Vence amanha';
    return `${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'} restantes`;
  };

  const daysUntilDue = getDaysUntilDue(payment.dueDate);
  const urgencyLevel = getUrgencyLevel(daysUntilDue);
  const urgencyColor = getUrgencyColor(urgencyLevel);
  const formattedDate = formatDate(payment.dueDate);
  
  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 ${urgencyColor} ${isAdditional ? 'ml-4 mt-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {payment.type === 'plano' ? (
            <CreditCard className="h-4 w-4" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
          <Badge 
            variant="outline" 
            className={`${urgencyColor} font-medium text-xs`}
          >
            {payment.type === 'plano' ? 'Mensal' : 'Semanal'}
          </Badge>
        </div>
        <span className="text-lg font-bold text-green-600">
          R$ {payment.amount.toFixed(2)}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3 w-3" />
            <span className="font-medium">
              {formattedDate.date} as {formattedDate.time}
            </span>
          </div>
        </div>
        <div className="text-sm font-medium">
          {getUrgencyText(daysUntilDue)}
        </div>
      </div>
    </div>
  );
};
