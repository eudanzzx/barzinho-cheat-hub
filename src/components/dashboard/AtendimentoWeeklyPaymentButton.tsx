import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import AtendimentoWeeklyPaymentControl from "./AtendimentoWeeklyPaymentControl";

interface AtendimentoWeeklyPaymentButtonProps {
  atendimentoId: string;
  clientName: string;
  semanalData: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

const AtendimentoWeeklyPaymentButton: React.FC<AtendimentoWeeklyPaymentButtonProps> = ({
  atendimentoId,
  clientName,
  semanalData,
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
        className="w-full border-green-600/30 text-green-600 hover:bg-green-600/10 hover:border-green-600 flex items-center gap-2 rounded-lg bg-green-50/50 min-h-[40px]"
      >
        <Calendar className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium">Pagamentos Semanais</span>
      </Button>
      {isOpen && (
        <div className="mt-2 w-full">
          <AtendimentoWeeklyPaymentControl
            atendimentoId={atendimentoId}
            clientName={clientName}
            semanalData={semanalData}
            startDate={startDate}
          />
        </div>
      )}
    </div>
  );
};

export default AtendimentoWeeklyPaymentButton;