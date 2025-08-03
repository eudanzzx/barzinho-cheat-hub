
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
    if (!dateString) return '';
    
    // Se já está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Para outros formatos, tenta conversão normal
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  // Usar cores do sistema tarot
  return (
    <div className={`rounded-xl border border-tarot-primary bg-tarot-accent shadow-sm p-4 transition-all duration-200 relative 
      ${isAdditional ? 'ml-4 mt-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="border-transparent bg-white/60 tarot-primary font-semibold px-3 py-1 text-xs"
            style={{ boxShadow: 'none' }}
          >
            {payment.type === "plano" ? "Mensal" : "Semanal"}
          </Badge>
        </div>
        <span className="text-lg font-bold text-green-600">
          R$ {(payment.amount || 0).toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm tarot-primary font-medium mb-1 mt-1">
        <Calendar className="h-4 w-4" />
        <span>
          {formattedDate}
        </span>
      </div>
      <div className="text-sm mt-0.5 font-medium tarot-primary mb-1">
        {getUrgencyText(daysUntilDue)}
      </div>
    </div>
  );
};
