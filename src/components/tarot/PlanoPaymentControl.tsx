
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CreditCard, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(true);
  const { planoMonths, handlePaymentToggle } = usePlanoMonths({
    analysisId,
    clientName,
    planoData,
    startDate,
  });

  console.log('PlanoPaymentControl - Renderizado:', {
    analysisId,
    clientName,
    planoData,
    planoMonthsCount: planoMonths.length
  });

  const paidCount = planoMonths.filter(m => m.isPaid).length;
  const totalValue = planoMonths.length * parseFloat(planoData.valorMensal);
  const paidValue = paidCount * parseFloat(planoData.valorMensal);

  return (
    <div className="w-full">
      {/* Header sempre visível */}
      <div className="bg-purple-50 border-b border-purple-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-800">Controle de Pagamentos Mensais</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-purple-700">
              {paidCount}/{planoMonths.length} pagos
            </span>
          </div>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 hover:bg-purple-50"
          >
            <span className="text-sm text-purple-700">
              Ver detalhes dos pagamentos
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 border-t border-purple-100">
            <PlanoControlHeader
              paidCount={paidCount}
              totalMonths={planoMonths.length}
              paidValue={paidValue}
              totalValue={totalValue}
              diaVencimento={planoData.diaVencimento}
            />
            
            <div className="mt-4">
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
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PlanoPaymentControl;
