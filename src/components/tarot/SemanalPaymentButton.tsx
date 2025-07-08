
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Calendar } from "lucide-react";
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

  console.log('SemanalPaymentButton - semanalData recebida:', semanalData);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500 transition-colors duration-200 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base">📅</span>
        <span>Semanais</span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[400px]">
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
