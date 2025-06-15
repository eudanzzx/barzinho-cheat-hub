
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Check, Calendar, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { PaymentCard } from "./PaymentCard";
import { GroupedPayment } from "./utils/paymentGrouping";

interface ClientPaymentGroupProps {
  group: GroupedPayment;
  onMarkAsPaid: (id: string) => void;
  onPostponePayment: (id: string) => void;
  onDeleteNotification: (id: string) => void;
}

export const ClientPaymentGroup: React.FC<ClientPaymentGroupProps> = ({
  group,
  onMarkAsPaid,
  onPostponePayment,
  onDeleteNotification
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasAdditionalPayments = group.additionalPayments.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              {group.clientName}
            </span>
            {hasAdditionalPayments && (
              <Badge variant="secondary" className="text-xs">
                +{group.additionalPayments.length} vencimento{group.additionalPayments.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            {group.mostUrgent.type === 'plano' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPostponePayment(group.mostUrgent.id)}
                className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-100"
                title="Adiar pagamento"
              >
                <Calendar className="h-3 w-3" />
              </Button>
            )}
            {group.mostUrgent.type === 'semanal' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeleteNotification(group.mostUrgent.id)}
                className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                title="Excluir notificacao"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMarkAsPaid(group.mostUrgent.id)}
              className="h-6 w-6 p-0 text-green-600 hover:bg-green-100"
              title="Marcar como pago"
            >
              <Check className="h-3 w-3" />
            </Button>
            {hasAdditionalPayments && (
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </div>
        
        <PaymentCard payment={group.mostUrgent} />
        
        {hasAdditionalPayments && (
          <CollapsibleContent className="space-y-2">
            {group.additionalPayments.map((payment) => (
              <PaymentCard 
                key={payment.id} 
                payment={payment} 
                isAdditional={true}
              />
            ))}
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
};
