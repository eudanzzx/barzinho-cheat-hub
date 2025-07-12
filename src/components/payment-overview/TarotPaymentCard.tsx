
import React, { memo, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

interface TarotPaymentCardProps {
  payment: PlanoMensal | PlanoSemanal;
  isPaid?: boolean;
  isMainCard?: boolean;
}

const TarotPaymentCard: React.FC<TarotPaymentCardProps> = memo(({
  payment,
  isPaid = false,
  isMainCard = false
}) => {
  const { daysUntilDue, urgencyText, formattedDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(payment.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let urgencyText: string;
    if (diffDays < 0) {
      urgencyText = `${Math.abs(diffDays)} dia${Math.abs(diffDays) === 1 ? "" : "s"} em atraso`;
    } else if (diffDays === 0) {
      urgencyText = "Vence hoje";
    } else if (diffDays === 1) {
      urgencyText = "Vence amanhã";
    } else {
      urgencyText = `${diffDays} dias restantes`;
    }
    
    return {
      daysUntilDue: diffDays,
      urgencyText,
      formattedDate: new Date(payment.dueDate).toLocaleDateString("pt-BR")
    };
  }, [payment.dueDate]);

  const cardClass = isMainCard 
    ? `rounded-xl border shadow-sm p-4 flex flex-col gap-2 relative mb-1 ${
        isPaid 
          ? 'border-green-200 bg-green-50' 
          : 'border-tarot-primary bg-tarot-accent'
      }`
    : "rounded-xl border border-tarot-primary bg-white shadow-sm p-3 flex flex-col gap-2 relative";

  return (
    <div className={cardClass}>
      <div className="flex justify-between items-center mb-1">
        <Badge
          variant="outline"
          className={`border-transparent font-semibold px-3 py-1 text-xs ${
            isPaid 
              ? 'bg-green-100 text-green-700' 
              : isMainCard 
                ? 'bg-white/60 tarot-primary'
                : 'bg-tarot-accent tarot-primary'
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
        isPaid ? 'text-green-700' : 'tarot-primary'
      } ${isMainCard ? 'text-sm' : 'text-xs'}`}>
        <Calendar className="h-4 w-4" />
        <span>
          {formattedDate}
        </span>
      </div>
      <div className={`font-medium ${
        isPaid ? 'text-green-600' : 'tarot-primary'
      } ${isMainCard ? 'text-sm' : 'text-xs'}`}>
        {isPaid ? "Pagamento confirmado" : urgencyText}
      </div>
    </div>
  );
});

TarotPaymentCard.displayName = 'TarotPaymentCard';

export default TarotPaymentCard;
