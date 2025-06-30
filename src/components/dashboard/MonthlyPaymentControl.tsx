
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useMonthlyPaymentControl } from "./MonthlyPaymentControl/useMonthlyPaymentControl";
import PaymentControlHeader from "./MonthlyPaymentControl/PaymentControlHeader";
import ClientGroup from "./MonthlyPaymentControl/ClientGroup";
import EmptyState from "./MonthlyPaymentControl/EmptyState";

const MonthlyPaymentControl: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    expandedClients,
    planos,
    groupedPlanos,
    handlePaymentToggle,
    toggleClientExpansion
  } = useMonthlyPaymentControl();

  return (
    <Card className="border-[#0553C7]/20 bg-gradient-to-br from-[#0553C7]/5 to-blue-50/50 shadow-lg w-full mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <PaymentControlHeader 
            clientCount={Object.keys(groupedPlanos).length}
            totalPayments={planos.length}
            isOpen={isOpen}
          />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-4 px-6 pb-6">
            {Object.keys(groupedPlanos).length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {Object.entries(groupedPlanos).map(([clientName, clientPlanos]) => (
                  <ClientGroup
                    key={clientName}
                    clientName={clientName}
                    clientPlanos={clientPlanos}
                    isExpanded={expandedClients.has(clientName)}
                    onToggleExpansion={toggleClientExpansion}
                    onPaymentToggle={handlePaymentToggle}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default MonthlyPaymentControl;
