
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import TarotPaymentCard from "./TarotPaymentCard";
import TarotPaymentActions from "./TarotPaymentActions";

interface TarotPaymentGroupProps {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  onMarkAsPaid: (paymentId: string) => void;
}

const TarotPaymentGroup: React.FC<TarotPaymentGroupProps> = ({
  clientName,
  mostUrgent,
  additionalPayments,
  onMarkAsPaid,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [clientName]);

  const uniqueAdditionalPayments = additionalPayments.filter((p) => p.id !== mostUrgent.id);
  const hasAdditionalPayments = uniqueAdditionalPayments.length > 0;

  function handleCollapsibleChange(open: boolean) {
    setIsOpen(open);
  }

  function handlePagoClick() {
    setIsPaid(true);
    onMarkAsPaid(mostUrgent.id);
  }

  return (
    <div className={`rounded-lg border p-4 shadow-sm mb-2 ${
      isPaid 
        ? 'border-green-200 bg-green-50/50' 
        : 'border-purple-200 bg-purple-50/30'
    }`}>
      <Collapsible open={isOpen} onOpenChange={handleCollapsibleChange}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{clientName}</span>
            {isPaid && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                Pago
              </Badge>
            )}
            {hasAdditionalPayments && !isPaid && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                +{uniqueAdditionalPayments.length} vencimento{uniqueAdditionalPayments.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasAdditionalPayments && (
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 p-0"
                  aria-label={isOpen ? "Esconder adicionais" : "Ver adicionais"}
                  tabIndex={0}
                >
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            )}
            <TarotPaymentActions 
              isPaid={isPaid}
              onMarkAsPaid={handlePagoClick}
            />
          </div>
        </div>
        
        <TarotPaymentCard 
          payment={mostUrgent}
          isPaid={isPaid}
          isMainCard={true}
        />
        
        {hasAdditionalPayments && (
          <CollapsibleContent className="pl-2 pt-1 space-y-1" forceMount>
            {uniqueAdditionalPayments.map((payment) => (
              <TarotPaymentCard 
                key={payment.id}
                payment={payment}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
};

export default TarotPaymentGroup;
