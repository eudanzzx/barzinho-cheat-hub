
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Calendar } from "lucide-react";
import { useSemanalWeeks } from "./semanal-control/useSemanalWeeks";
import { SemanalControlHeader } from "./semanal-control/SemanalControlHeader";
import { SemanalWeekButton } from "./semanal-control/SemanalWeekButton";

interface SemanalPaymentControlProps {
  analysisId: string;
  clientName: string;
  semanalData: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

const SemanalPaymentControl: React.FC<SemanalPaymentControlProps> = ({
  analysisId,
  clientName,
  semanalData,
  startDate,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { semanalWeeks, handlePaymentToggle } = useSemanalWeeks({
    analysisId,
    clientName,
    semanalData,
    startDate,
  });

  console.log('SemanalPaymentControl - Renderizado:', {
    analysisId,
    clientName,
    semanalData,
    semanalWeeksCount: semanalWeeks.length
  });

  const paidCount = semanalWeeks.filter(w => w.isPaid).length;
  const totalValue = semanalWeeks.length * parseFloat(semanalData.valorSemanal);
  const paidValue = paidCount * parseFloat(semanalData.valorSemanal);

  return (
    <div className="w-full">
      {/* Header sempre visível */}
      <div className="bg-emerald-50 border-b border-emerald-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-emerald-800">Controle de Pagamentos Semanais</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-emerald-700">
              {paidCount}/{semanalWeeks.length} pagos
            </span>
          </div>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 hover:bg-emerald-50"
          >
            <span className="text-sm text-emerald-700">
              Ver detalhes dos pagamentos
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 border-t border-emerald-100">
            <SemanalControlHeader
              paidCount={paidCount}
              totalWeeks={semanalWeeks.length}
              paidValue={paidValue}
              totalValue={totalValue}
              diaVencimento={semanalData.diaVencimento}
            />
            
            <div className="mt-4">
              {semanalWeeks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Carregando semanas...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {semanalWeeks.map((week, index) => (
                    <SemanalWeekButton
                      key={week.week}
                      week={week}
                      index={index}
                      onToggle={handlePaymentToggle}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SemanalPaymentControl;
