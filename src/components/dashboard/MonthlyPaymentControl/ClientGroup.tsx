
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PlanoMensal } from "@/types/payment";
import PaymentItem from "./PaymentItem";

interface ClientGroupProps {
  clientName: string;
  clientPlanos: PlanoMensal[];
  isExpanded: boolean;
  onToggleExpansion: (clientName: string) => void;
  onPaymentToggle: (planoId: string, clientName: string, isPaid: boolean) => void;
}

const ClientGroup: React.FC<ClientGroupProps> = ({
  clientName,
  clientPlanos,
  isExpanded,
  onToggleExpansion,
  onPaymentToggle
}) => {
  return (
    <div className="border border-[#0553C7]/20 rounded-lg bg-white shadow-sm">
      <div 
        className="p-4 cursor-pointer hover:bg-[#0553C7]/5 transition-colors flex items-center justify-between"
        onClick={() => onToggleExpansion(clientName)}
      >
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-[#0553C7] text-lg">{clientName}</h4>
          <Badge className="bg-[#0553C7]/10 text-[#0553C7] border-[#0553C7]/20">
            {clientPlanos.length} pagamento(s)
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="p-1">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-[#0553C7]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#0553C7]" />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="border-t border-[#0553C7]/10 bg-[#0553C7]/5">
          <div className="p-4 space-y-3">
            {clientPlanos.map((plano) => (
              <PaymentItem 
                key={plano.id} 
                plano={plano}
                onPaymentToggle={onPaymentToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientGroup;
