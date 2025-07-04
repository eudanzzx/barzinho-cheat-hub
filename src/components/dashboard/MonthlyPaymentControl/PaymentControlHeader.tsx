
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentControlHeaderProps {
  clientCount: number;
  totalPayments: number;
  isOpen: boolean;
}

const PaymentControlHeader: React.FC<PaymentControlHeaderProps> = ({
  clientCount,
  totalPayments,
  isOpen
}) => {
  const isMobile = useIsMobile();

  // Layout compacto para mobile
  if (isMobile) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-1.5 rounded-full bg-[#0553C7]/20">
            <CreditCard className="h-4 w-4 text-[#0553C7]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#0553C7] truncate">
              Pagamentos Mensais
            </h3>
            <p className="text-xs text-[#0553C7]/70">
              {clientCount} cliente(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge 
            variant="secondary" 
            className="bg-[#0553C7]/10 text-[#0553C7] border-[#0553C7]/20 text-xs px-2 py-0.5"
          >
            {totalPayments}
          </Badge>
          <ChevronDown className={cn(
            "h-5 w-5 text-[#0553C7] transition-transform duration-300",
            isOpen && "rotate-180"
          )} />
        </div>
      </div>
    );
  }

  // Layout completo para desktop
  return (
    <CardHeader className="cursor-pointer hover:bg-[#0553C7]/10 transition-colors pb-3 border-b border-[#0553C7]/10">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-3 text-[#0553C7]">
          <div className="p-2 rounded-full bg-[#0553C7]/10">
            <CreditCard className="h-5 w-5 text-[#0553C7]" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Controle de Pagamentos Mensais</h3>
            <p className="text-sm text-[#0553C7]/70 font-normal">
              {clientCount} cliente(s) - Clique para {isOpen ? 'fechar' : 'abrir'}
            </p>
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="bg-[#0553C7]/10 text-[#0553C7] border-[#0553C7]/20 text-base px-3 py-1"
          >
            {totalPayments}
          </Badge>
          <ChevronDown className={cn(
            "h-6 w-6 text-[#0553C7] transition-transform duration-300",
            isOpen && "rotate-180"
          )} />
        </div>
      </div>
    </CardHeader>
  );
};

export default PaymentControlHeader;
