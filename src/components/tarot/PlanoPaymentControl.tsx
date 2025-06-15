
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePlanoMonths } from "./payment-control/usePlanoMonths";
import { PlanoControlHeader } from "./payment-control/PlanoControlHeader";
import { PlanoMonthButton } from "./payment-control/PlanoMonthButton";

interface PlanoPaymentControlProps {
  analysisId: string;
  clientName: string;
  planoData: {
    meses: string;
    valorMensal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

const PlanoPaymentControl: React.FC<PlanoPaymentControlProps> = ({
  analysisId,
  clientName,
  planoData,
  startDate,
}) => {
  const { planoMonths, handlePaymentToggle } = usePlanoMonths({
    analysisId,
    clientName,
    planoData,
    startDate,
  });

  const paidCount = planoMonths.filter(m => m.isPaid).length;
  const totalValue = planoMonths.length * parseFloat(planoData.valorMensal);
  const paidValue = paidCount * parseFloat(planoData.valorMensal);

  return (
    <Card className="mt-4 border-gray-200">
      <PlanoControlHeader
        paidCount={paidCount}
        totalMonths={planoMonths.length}
        paidValue={paidValue}
        totalValue={totalValue}
        diaVencimento={planoData.diaVencimento}
      />
      
      <CardContent className="p-4">
        {planoMonths.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Carregando meses do plano...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {planoMonths.map((month, index) => (
              <PlanoMonthButton
                key={month.month}
                month={month}
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

export default PlanoPaymentControl;
