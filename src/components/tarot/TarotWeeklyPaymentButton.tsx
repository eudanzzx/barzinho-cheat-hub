
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import TarotWeeklyPaymentControl from "./TarotWeeklyPaymentControl";

interface TarotWeeklyPaymentButtonProps {
  analysisId: string;
  clientName: string;
  semanalData: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

const TarotWeeklyPaymentButton: React.FC<TarotWeeklyPaymentButtonProps> = ({
  analysisId,
  clientName,
  semanalData,
  startDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log('🟢 TarotWeeklyPaymentButton renderizado:', { 
    analysisId, 
    clientName, 
    semanalData,
    startDate,
    isOpen 
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🟢 TarotWeeklyPaymentButton clicado, alternando de:', isOpen, 'para:', !isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="w-full border-emerald-600/30 text-emerald-600 hover:bg-emerald-600/10 hover:border-emerald-600 transition-colors duration-200 flex items-center gap-2 rounded-lg bg-emerald-50/50 min-h-[40px]"
      >
        <Calendar className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium">Pagamentos Semanais</span>
      </Button>
      {isOpen && (
        <div className="mt-2 w-full">
          <TarotWeeklyPaymentControl
            analysisId={analysisId}
            clientName={clientName}
            semanalData={semanalData}
            startDate={startDate}
          />
        </div>
      )}
    </div>
  );
};

export default TarotWeeklyPaymentButton;
