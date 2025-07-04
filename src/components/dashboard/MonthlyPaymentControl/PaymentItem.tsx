
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanoMensal } from "@/types/payment";

interface PaymentItemProps {
  plano: PlanoMensal;
  onPaymentToggle: (planoId: string, clientName: string, isPaid: boolean) => void;
}

const PaymentItem: React.FC<PaymentItemProps> = ({ plano, onPaymentToggle }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysOverdue = getDaysOverdue(plano.dueDate);
  const isOverdue = daysOverdue > 0;
  const isPaid = !plano.active; // active = false significa que foi pago

  return (
    <div 
      className={cn(
        "border-l-4 p-4 rounded-lg transition-all duration-200",
        isPaid 
          ? "border-l-green-500 bg-green-50" // Verde quando pago
          : isOverdue
          ? "border-l-red-500 bg-red-50"
          : "border-l-[#0553C7] bg-white"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={cn(
              isPaid 
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-[#0553C7]/10 text-[#0553C7] border-[#0553C7]/20"
            )}>
              {plano.month}º Mês
            </Badge>
            {isOverdue && !isPaid && (
              <Badge variant="destructive" className="text-xs">
                {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrasado
              </Badge>
            )}
            {isPaid && (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                ✓ Pago
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            <div>
              <span className="font-medium text-green-600">Valor:</span>
              <span className="ml-1 font-bold">R$ {plano.amount.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium text-orange-600">Vencimento:</span>
              <span className="ml-1 font-bold">{formatDate(plano.dueDate)}</span>
            </div>
          </div>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onPaymentToggle(plano.id, plano.clientName, !isPaid);
          }}
          size="sm"
          className={cn(
            "transition-all duration-200 w-full sm:w-auto",
            isPaid
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          )}
        >
          {isPaid ? (
            <>
              <X className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Marcar Pendente</span>
              <span className="sm:hidden">Pendente</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Marcar Pago</span>
              <span className="sm:hidden">Pagar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentItem;
