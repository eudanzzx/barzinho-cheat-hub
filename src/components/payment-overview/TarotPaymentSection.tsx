
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import TarotPaymentGroup from "./TarotPaymentGroup";

interface GroupedPayment {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  totalPayments: number;
}

interface TarotPaymentSectionProps {
  groupedPayments: GroupedPayment[];
  onMarkAsPaid: (paymentId: string) => void;
}

const TarotPaymentSection: React.FC<TarotPaymentSectionProps> = ({
  groupedPayments,
  onMarkAsPaid,
}) => {
  if (groupedPayments.length === 0) {
    return (
      <div className="p-4 text-slate-500 text-center">
        <AlertTriangle className="h-6 w-6 mx-auto mb-3 opacity-40" />
        Nenhum vencimento de análises de tarot
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedPayments.map((group) => (
        <TarotPaymentGroup
          key={group.clientName}
          clientName={group.clientName}
          mostUrgent={group.mostUrgent}
          additionalPayments={group.additionalPayments}
          onMarkAsPaid={onMarkAsPaid}
        />
      ))}
    </div>
  );
};

export default TarotPaymentSection;
