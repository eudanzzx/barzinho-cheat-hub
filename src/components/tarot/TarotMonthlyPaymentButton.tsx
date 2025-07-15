
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
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

  console.log('🔵 TarotMonthlyPaymentButton renderizado:', { 
    analysisId, 
    clientName, 
    planoData,
    startDate,
    isOpen 
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔵 TarotMonthlyPaymentButton clicado, alternando de:', isOpen, 'para:', !isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="w-full border-purple-600/30 text-purple-600 hover:bg-purple-600/10 hover:border-purple-600 transition-colors duration-200 flex items-center gap-2 rounded-lg bg-purple-50/50 min-h-[40px]"
      >
        <CreditCard className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium">Pagamentos Mensais</span>
      </Button>
      {isOpen && (
        <div className="mt-2 w-full">
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
