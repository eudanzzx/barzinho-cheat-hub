
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import TarotMonthlyPaymentControl from "./TarotMonthlyPaymentControl";

interface TarotMonthlyPaymentButtonProps {
  analysisId: string;
  clientName: string;
  planoData: {
    meses: string;
    valorMensal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

const TarotMonthlyPaymentButton: React.FC<TarotMonthlyPaymentButtonProps> = ({
  analysisId,
  clientName,
  planoData,
  startDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="border-[#0553C7]/30 text-[#0553C7] hover:bg-[#0553C7]/10 hover:border-[#0553C7] transition-colors duration-200 flex items-center gap-2 rounded-lg bg-blue-50/50"
      >
        <Calendar className="h-4 w-4" />
        Pagamentos Mensais
      </Button>
      {isOpen && (
        <div className="mt-2">
          <TarotMonthlyPaymentControl
            analysisId={analysisId}
            clientName={clientName}
            planoData={planoData}
            startDate={startDate}
          />
        </div>
      )}
    </div>
  );
};

export default TarotMonthlyPaymentButton;
