
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, Calendar } from "lucide-react";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

interface PaymentCardProps {
  payment: PlanoMensal | PlanoSemanal;
  isAdditional?: boolean;
  formattedDate: { date: string; time: string };
  urgencyColor: string;
  daysUntilDue: number;
  urgencyText: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  isAdditional = false,
  formattedDate,
  urgencyColor,
  daysUntilDue,
  urgencyText,
}) => (
  <div className={`p-3 rounded-lg border transition-all duration-200 ${urgencyColor} ${isAdditional ? 'ml-4 mt-2' : ''}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        {payment.type === 'plano' ? (
          <CreditCard className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <Badge 
          variant="outline" 
          className={`${urgencyColor} font-medium text-xs`}
        >
          {payment.type === 'plano' ? 'Mensal' : 'Semanal'}
        </Badge>
        {payment.analysisId && (
          <Badge 
            variant="outline" 
            className="bg-purple-100 text-purple-600 border-purple-200 text-xs"
          >
            Tarot
          </Badge>
        )}
      </div>
      <span className="text-lg font-bold text-green-600">
        R$ {payment.amount.toFixed(2)}
      </span>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-3 w-3" />
          <span className="font-medium">
            {formattedDate.date}
          </span>
        </div>
      </div>
      <div className="text-sm font-medium">
        {urgencyText}
      </div>
    </div>
  </div>
);

export default PaymentCard;

