
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, Calendar, Trash2, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { PaymentCard } from "./PaymentCard";
import { GroupedPayment } from "./utils/paymentGrouping";

interface ClientPaymentGroupProps {
  group: GroupedPayment;
  onMarkAsPaid: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onViewDetails?: (payment: any) => void;
}

export const ClientPaymentGroup: React.FC<ClientPaymentGroupProps> = ({
  group,
  onMarkAsPaid,
  onDeleteNotification,
  onViewDetails
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filtro refeito: remova QUALQUER adicional com mesmo id do mostUrgent
  const additionalPayments = group.additionalPayments.filter(
    (payment) => payment.id !== group.mostUrgent.id
  );
  // Garantir deduplicação total por id, inclusive cross-verificando com mostUrgent
  const uniqueAdditionalPayments = Array.from(
    new Map(
      additionalPayments
        .filter(p => p.id !== group.mostUrgent.id)
        .map((p) => [p.id, p])
    ).values()
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
            {/* Botão Ver Detalhes */}
            {onViewDetails && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewDetails(group.mostUrgent)}
                className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-100"
                title="Ver detalhes"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
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
            <div className="max-h-64 overflow-y-auto pr-2">
              {uniqueAdditionalPayments.map((payment) => (
                <div key={payment.id} className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <PaymentCard 
                      payment={payment} 
                      isAdditional={true}
                    />
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {/* Botão Ver Detalhes para pagamentos adicionais */}
                    {onViewDetails && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails(payment)}
                        className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-100"
                        title="Ver detalhes"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    {/* Excluir pagamento adicional - só se semanal */}
                    {payment.type === 'semanal' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteNotification(payment.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                        title="Excluir notificacao"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    {/* Botão de marcar como pago para pagamentos adicionais */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMarkAsPaid(payment.id)}
                      className="h-6 w-6 p-0 bg-green-50 hover:bg-green-200 text-green-600 border border-green-100 shadow-sm transition"
                      title="Marcar como pago"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
};
