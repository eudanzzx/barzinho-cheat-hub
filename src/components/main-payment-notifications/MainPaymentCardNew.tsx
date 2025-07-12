import React, { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";  
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

interface MainPaymentCardNewProps {
  payment: PlanoMensal | PlanoSemanal;
  isAdditional?: boolean;
}

export const MainPaymentCardNew: React.FC<MainPaymentCardNewProps> = memo(({ payment, isAdditional = false }) => {
  const { daysUntilDue, formattedDate, urgencyText } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(payment.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let urgencyText: string;
    if (diffDays < 0) {
      urgencyText = `${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'dia' : 'dias'} em atraso`;
    } else if (diffDays === 0) {
      urgencyText = 'Vence hoje';
    } else if (diffDays === 1) {
      urgencyText = 'Vence amanhã';
    } else {
      urgencyText = `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} restantes`;
    }
    
    const formattedDate = new Date(payment.dueDate).toLocaleDateString('pt-BR');
    
    return {
      daysUntilDue: diffDays,
      formattedDate,
      urgencyText
    };
  }, [payment.dueDate]);

    // Usar cores do sistema: azul principal para todos os atendimentos
    return (
      <div className={`rounded-xl border border-main-primary bg-main-accent shadow-sm p-4 transition-all duration-200 relative 
        ${isAdditional ? 'ml-4 mt-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="border-transparent bg-white/60 main-primary font-semibold px-3 py-1 text-xs"
            style={{ boxShadow: 'none' }}
          >
            {payment.type === "plano" ? "Mensal" : "Semanal"}
          </Badge>
        </div>
        <span className="text-lg font-bold text-green-600">
          R$ {(payment.amount || 0).toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm main-primary font-medium mb-1 mt-1">
        <Calendar className="h-4 w-4" />
        <span>
          {formattedDate}
        </span>
      </div>
      <div className="text-sm mt-0.5 main-primary font-medium mb-1">
        {urgencyText}
      </div>
    </div>
  );
});

MainPaymentCardNew.displayName = 'MainPaymentCardNew';