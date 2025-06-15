
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  const { semanalWeeks, handlePaymentToggle } = useSemanalWeeks({
    analysisId,
    clientName,
    semanalData,
    startDate,
  });

  const paidCount = semanalWeeks.filter(w => w.isPaid).length;
  const totalValue = semanalWeeks.length * parseFloat(semanalData.valorSemanal);
  const paidValue = paidCount * parseFloat(semanalData.valorSemanal);

  return (
    <Card className="mt-4 border-gray-200">
      <SemanalControlHeader
        paidCount={paidCount}
        totalWeeks={semanalWeeks.length}
        paidValue={paidValue}
        totalValue={totalValue}
        diaVencimento={semanalData.diaVencimento}
      />
      
      <CardContent className="p-4">
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
      </CardContent>
    </Card>
  );
};

export default SemanalPaymentControl;
