
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import PlanoPaymentControl from "./PlanoPaymentControl";

interface PlanoPaymentButtonProps {
  analysisId: string;
  clientName: string;
  planoData: {
    meses: string;
    valorMensal: string;
  };
  startDate: string;
}

const PlanoPaymentButton: React.FC<PlanoPaymentButtonProps> = ({
  analysisId,
  clientName,
  planoData,
  startDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log('PlanoPaymentButton - Renderizado:', { 
    analysisId, 
    clientName, 
    planoData, 
    isOpen 
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PlanoPaymentButton - Toggle clicado:', !isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block w-full">
      <Button
        variant="outline"
        size="sm"
        className="w-full border-purple-500/30 text-purple-700 hover:bg-purple-50 hover:border-purple-500 transition-colors duration-200 flex items-center justify-center gap-1 px-2 py-1.5 text-xs h-8"
        onClick={handleToggle}
        type="button"
      >
        <span className="font-medium text-xs">Mensais</span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform duration-200 flex-shrink-0",
          isOpen && "rotate-180"
        )} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 sm:left-0 sm:transform-none mt-2 z-[9999] w-[95vw] max-w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg">
          <PlanoPaymentControl
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

export default PlanoPaymentButton;
