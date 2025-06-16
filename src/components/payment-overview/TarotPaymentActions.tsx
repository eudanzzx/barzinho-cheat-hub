
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface TarotPaymentActionsProps {
  isPaid: boolean;
  onMarkAsPaid: () => void;
}

const TarotPaymentActions: React.FC<TarotPaymentActionsProps> = ({
  isPaid,
  onMarkAsPaid
}) => {
  if (isPaid) {
    return (
      <Badge className="bg-green-500 text-white px-3 py-1">
        <CheckCircle className="h-4 w-4 mr-1" />
        Pago
      </Badge>
    );
  }

  return (
    <Button
      className="ml-1 px-3 h-8 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-sm flex gap-1 items-center shadow-md transition"
      title="Marcar como pago"
      type="button"
      onClick={onMarkAsPaid}
    >
      <CheckCircle className="h-4 w-4 mr-1" />
      Pago
    </Button>
  );
};

export default TarotPaymentActions;
