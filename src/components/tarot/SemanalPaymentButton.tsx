
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import SemanalPaymentControl from "./SemanalPaymentControl";

interface SemanalPaymentButtonProps {
  analysisId: string;
  clientName: string;
  semanalData: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

const SemanalPaymentButton: React.FC<SemanalPaymentButtonProps> = ({
  analysisId,
  clientName,
  semanalData,
  startDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log('SemanalPaymentButton - Renderizado:', { 
    analysisId, 
    clientName, 
    semanalData, 
    isOpen 
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('SemanalPaymentButton - Toggle clicado:', !isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block w-full">
      <Button
        variant="outline"
        size="sm"
        className="w-full border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500 transition-colors duration-200 flex items-center justify-center gap-1 px-2 py-1.5 text-xs h-8"
        onClick={handleToggle}
        type="button"
      >
        <span className="font-medium text-xs">Semanais</span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform duration-200 flex-shrink-0",
          isOpen && "rotate-180"
        )} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 sm:left-0 sm:transform-none mt-2 z-[9999] w-[95vw] max-w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg">
          <SemanalPaymentControl
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

export default SemanalPaymentButton;
