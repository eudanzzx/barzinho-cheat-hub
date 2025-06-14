
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import PaymentCard from "./PaymentCard";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

// Definição local do tipo GroupedPayment
interface GroupedPayment {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  totalPayments: number;
}

interface ClientPaymentGroupProps {
  group: GroupedPayment;
  isPrincipal: boolean;
  expanded: boolean;
  onToggleExpand: (normalizedClientName: string) => void;
  normalizeClientName: (name: string) => string;
  getDaysUntilDue: (dueDate: string) => number;
  getUrgencyLevel: (daysUntilDue: number) => string;
  getUrgencyColor: (urgencyLevel: string, isPrincipal: boolean) => string;
  getUrgencyText: (daysUntilDue: number) => string;
  formatDate: (dateString: string) => { date: string; time: string };
}

const ClientPaymentGroup: React.FC<ClientPaymentGroupProps> = ({
  group,
  isPrincipal,
  expanded,
  onToggleExpand,
  normalizeClientName,
  getDaysUntilDue,
  getUrgencyLevel,
  getUrgencyColor,
  getUrgencyText,
  formatDate,
}) => {
  const hasAdditionalPayments = group.additionalPayments.length > 0;
  const payment = group.mostUrgent;
  const daysUntilDue = getDaysUntilDue(payment.dueDate);
  const urgencyLevel = getUrgencyLevel(daysUntilDue);
  const urgencyColor = getUrgencyColor(urgencyLevel, !payment.analysisId);
  const formattedDate = formatDate(payment.dueDate);
  const urgencyText = getUrgencyText(daysUntilDue);

  return (
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
        {hasAdditionalPayments && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={() => {
              onToggleExpand(normalizeClientName(group.clientName));
            }}
            aria-label={expanded ? "Fechar vencimentos do cliente" : "Abrir vencimentos do cliente"}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <PaymentCard 
        payment={payment} 
        formattedDate={formattedDate}
        urgencyColor={urgencyColor}
        daysUntilDue={daysUntilDue}
        urgencyText={urgencyText}
      />

      {/* Lista de pagamentos adicionais se expandido */}
      {hasAdditionalPayments && expanded && (
        <div
          className="space-y-2 mt-2 border-2 border-dashed border-red-600 bg-red-100/60 p-2 rounded-lg"
          style={{ position: 'relative', zIndex: 2 }}
        >
          {group.additionalPayments.map((payment) => {
            const days = getDaysUntilDue(payment.dueDate);
            const urgency = getUrgencyLevel(days);
            const color = getUrgencyColor(urgency, !payment.analysisId);
            return (
              <PaymentCard 
                key={payment.id} 
                payment={payment} 
                formattedDate={formatDate(payment.dueDate)}
                urgencyColor={color}
                daysUntilDue={days}
                urgencyText={getUrgencyText(days)}
                isAdditional={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientPaymentGroup;

