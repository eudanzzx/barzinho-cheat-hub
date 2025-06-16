
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CreditCard } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-colors duration-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Controle de Pagamentos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {paidCount}/{planoMonths.length} pagos
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="mt-2 border-gray-200">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PlanoPaymentControl;
