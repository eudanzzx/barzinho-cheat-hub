import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";  
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

interface MainPaymentCardNewProps {
  payment: PlanoMensal | PlanoSemanal;
  isAdditional?: boolean;
}

export const MainPaymentCardNew: React.FC<MainPaymentCardNewProps> = ({ payment, isAdditional = false }) => {
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

    // Cores azuis para mensal, roxas para semanal
    const isMonthly = payment.type === "plano";
    return (
      <div className={`rounded-xl border shadow-sm p-4 transition-all duration-200 relative 
        ${isMonthly 
          ? 'border-[#60a5fa] bg-[#eff6ff]' 
          : 'border-[#ceb8fa] bg-[#f6f0ff]'
        } 
        ${isAdditional ? 'ml-4 mt-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`border-transparent bg-white/60 font-semibold px-3 py-1 text-xs ${
              payment.type === "plano" ? "text-[#0ea5e9]" : "text-[#8e46dd]"
            }`}
            style={{ boxShadow: 'none' }}
          >
            {payment.type === "plano" ? "Mensal" : "Semanal"}
          </Badge>
        </div>
        <span className="text-lg font-bold text-green-600">
          R$ {(payment.amount || 0).toFixed(2)}
        </span>
      </div>
      <div className={`flex items-center gap-2 text-sm font-medium mb-1 mt-1 ${
        payment.type === "plano" ? "text-[#0ea5e9]" : "text-[#8e46dd]"
      }`}>
        <Calendar className="h-4 w-4" />
        <span>
          {formattedDate.date} às {formattedDate.time}
        </span>
      </div>
      <div className={`text-sm mt-0.5 font-medium mb-1 ${
        payment.type === "plano" ? "text-[#0284c7]" : "text-[#9156e0]"
      }`}>
        {getUrgencyText(daysUntilDue)}
      </div>
    </div>
  );
};