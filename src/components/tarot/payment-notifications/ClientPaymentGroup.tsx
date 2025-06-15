
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, Calendar, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { PaymentCard } from "./PaymentCard";
import { GroupedPayment } from "./utils/paymentGrouping";

interface ClientPaymentGroupProps {
  group: GroupedPayment;
  onMarkAsPaid: (id: string) => void;
  // Removido o onPostponePayment dos props pois não é mais utilizado
  onDeleteNotification: (id: string) => void;
}

export const ClientPaymentGroup: React.FC<ClientPaymentGroupProps> = ({
  group,
  onMarkAsPaid,
  onDeleteNotification
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filtro refeito: não mostrar mostUrgent entre os adicionais (mesmo que apareça repetido por falha de geração)
  const additionalPayments = group.additionalPayments.filter(
    (payment) =>
      payment.id !== group.mostUrgent.id
  );
  // Adicional: garantir que não haja duplicados usando Set (pelo id)
  const uniqueAdditionalPayments = Array.from(
    new Map(additionalPayments.map((p) => [p.id, p])).values()
  );
  const hasAdditionalPayments = uniqueAdditionalPayments.length > 0;

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
                +{uniqueAdditionalPayments.length} vencimento{uniqueAdditionalPayments.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex gap-1 ml-2 items-center">
            {/* Excluir pagamento - só se semanal */}
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
            {/* Botão de marcar como pago */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onMarkAsPaid(group.mostUrgent.id)}
              className="h-8 w-8 p-0 bg-green-50 hover:bg-green-200 text-green-600 border border-green-100 shadow-sm transition"
              title="Marcar como pago"
            >
              <CheckCircle className="h-6 w-6" />
            </Button>
            {/* Toggle de ver mais */}
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
            {uniqueAdditionalPayments.map((payment) => (
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

