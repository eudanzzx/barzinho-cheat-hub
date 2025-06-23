
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Check, Trash2 } from "lucide-react";
import { MainPaymentCard } from "./MainPaymentCard";

interface MainClientPaymentGroupProps {
  group: any;
  onMarkAsPaid: (paymentId: string) => void;
  onDeleteNotification: (paymentId: string) => void;
}

export const MainClientPaymentGroup: React.FC<MainClientPaymentGroupProps> = ({
  group,
  onMarkAsPaid,
  onDeleteNotification,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCollapsibleChange = (open: boolean) => {
    setIsOpen(open);
  };

  const hasAdditionalPayments = group.additionalPayments.length > 0;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 shadow-sm">
      <Collapsible open={isOpen} onOpenChange={handleCollapsibleChange}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{group.clientName}</span>
            {hasAdditionalPayments && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                +{group.additionalPayments.length} vencimento{group.additionalPayments.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasAdditionalPayments && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 p-0"
                  aria-label={isOpen ? "Esconder adicionais" : "Ver adicionais"}
                >
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            )}
            <Button
              onClick={() => onDeleteNotification(group.mostUrgent.id)}
              size="sm"
              variant="outline"
              className="ml-1 px-2 h-7 text-xs hover:bg-red-50 hover:border-red-300 text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => onMarkAsPaid(group.mostUrgent.id)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-7 flex-shrink-0"
            >
              <Check className="h-3 w-3 mr-1" />
              Pago
            </Button>
          </div>
        </div>
        
        <MainPaymentCard payment={group.mostUrgent} />
        
        {hasAdditionalPayments && (
          <CollapsibleContent className="space-y-2 mt-2">
            {group.additionalPayments.map((payment: any) => (
              <div key={payment.id} className="ml-4">
                <MainPaymentCard payment={payment} isAdditional={true} />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    onClick={() => onDeleteNotification(payment.id)}
                    size="sm"
                    variant="outline"
                    className="px-2 h-6 text-xs hover:bg-red-50 hover:border-red-300 text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => onMarkAsPaid(payment.id)}
                    size="sm"
                    variant="outline"
                    className="px-2 h-6 text-xs hover:bg-green-50 hover:border-green-300"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
};
