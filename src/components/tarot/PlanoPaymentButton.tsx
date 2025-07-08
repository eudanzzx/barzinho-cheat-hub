
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CreditCard } from "lucide-react";
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

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="border-purple-500/30 text-purple-700 hover:bg-purple-50 hover:border-purple-500 transition-colors duration-200 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base">💳</span>
        <span>Mensais</span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[400px]">
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
