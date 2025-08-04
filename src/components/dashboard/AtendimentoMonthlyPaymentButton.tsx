import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import AtendimentoMonthlyPaymentControl from "./AtendimentoMonthlyPaymentControl";

interface AtendimentoMonthlyPaymentButtonProps {
  atendimentoId: string;
  clientName: string;
  planoData: {
    meses: string;
    valorMensal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

const AtendimentoMonthlyPaymentButton: React.FC<AtendimentoMonthlyPaymentButtonProps> = ({
  atendimentoId,
  clientName,
  planoData,
  startDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="w-full border-blue-600/30 text-blue-600 hover:bg-blue-600/10 hover:border-blue-600 flex items-center gap-2 rounded-lg bg-blue-50/50 min-h-[40px]"
      >
        <CreditCard className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium">Pagamentos Mensais</span>
      </Button>
      {isOpen && (
        <div className="mt-2 w-full">
          <AtendimentoMonthlyPaymentControl
            atendimentoId={atendimentoId}
            clientName={clientName}
            planoData={planoData}
            startDate={startDate}
          />
        </div>
      )}
    </div>
  );
};

export default AtendimentoMonthlyPaymentButton;