
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

interface TarotPaymentCardProps {
  payment: PlanoMensal | PlanoSemanal;
  isPaid?: boolean;
  isMainCard?: boolean;
}

const TarotPaymentCard: React.FC<TarotPaymentCardProps> = ({
  payment,
  isPaid = false,
  isMainCard = false
}) => {
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyText = (daysUntilDue: number) => {
    if (daysUntilDue < 0)
      return `${Math.abs(daysUntilDue)} dia${Math.abs(daysUntilDue) === 1 ? "" : "s"} em atraso`;
    if (daysUntilDue === 0) return "Vence hoje";
    if (daysUntilDue === 1) return "Vence amanhã";
    return `${daysUntilDue} dias restantes`;
  };

  const cardClass = isMainCard 
    ? `rounded-xl border shadow-sm p-4 flex flex-col gap-2 relative mb-1 ${
        isPaid 
          ? 'border-green-200 bg-green-50' 
          : 'border-[#ceb8fa] bg-[#f6f0ff]'
      }`
    : "rounded-xl border border-[#ceb8fa] bg-white shadow-sm p-3 flex flex-col gap-2 relative";

  return (
    <div className={cardClass}>
      <div className="flex justify-between items-center mb-1">
        <Badge
          variant="outline"
          className={`border-transparent font-semibold px-3 py-1 text-xs ${
            isPaid 
              ? 'bg-green-100 text-green-700' 
              : isMainCard 
                ? 'bg-white/60 text-[#8e46dd]'
                : 'bg-purple-100 text-[#8e46dd]'
          }`}
          style={{ boxShadow: "none" }}
        >
          {payment.type === "plano" ? "Mensal" : "Semanal"}
        </Badge>
        <span className={`font-bold text-green-600 ${isMainCard ? 'text-lg' : 'text-base'}`}>
          R$ {payment.amount.toFixed(2)}
        </span>
      </div>
      <div className={`flex items-center gap-2 font-medium ${
        isPaid ? 'text-green-700' : 'text-[#8e46dd]'
      } ${isMainCard ? 'text-sm' : 'text-xs'}`}>
        <Calendar className="h-4 w-4" />
        <span>
          {(() => {
            const date = new Date(payment.dueDate);
            return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          })()}
        </span>
      </div>
      <div className={`font-medium ${
        isPaid ? 'text-green-600' : 'text-[#9156e0]'
      } ${isMainCard ? 'text-sm' : 'text-xs'}`}>
        {isPaid ? "Pagamento confirmado" : getUrgencyText(getDaysUntilDue(payment.dueDate))}
      </div>
    </div>
  );
};

export default TarotPaymentCard;
