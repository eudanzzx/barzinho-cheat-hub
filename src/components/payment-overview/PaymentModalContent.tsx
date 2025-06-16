
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Sparkles } from 'lucide-react';
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import PaymentSection from "./PaymentSection";
import TarotPaymentSection from "./TarotPaymentSection";

interface GroupedPayment {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  totalPayments: number;
}

interface SeparatedGroupedPayments {
  principal: GroupedPayment[];
  tarot: GroupedPayment[];
}

interface PaymentModalContentProps {
  context: 'principal' | 'tarot' | 'all';
  filteredPayments: SeparatedGroupedPayments;
  filteredTarotGroups: GroupedPayment[];
  expandedClients: string[];
  toggleExpandClient: (normalizedClientName: string) => void;
  normalizeClientName: (name: string) => string;
  getDaysUntilDue: (dueDate: string) => number;
  getUrgencyLevel: (daysUntilDue: number) => string;
  getUrgencyColor: (urgencyLevel: string, isPrincipal?: boolean) => string;
  getUrgencyText: (daysUntilDue: number) => string;
  formatDate: (dateString: string) => { date: string; time: string };
  handleMarkAsPaidTarot: (paymentId: string) => void;
}

const PaymentModalContent: React.FC<PaymentModalContentProps> = ({
  context,
  filteredPayments,
  filteredTarotGroups,
  expandedClients,
  toggleExpandClient,
  normalizeClientName,
  getDaysUntilDue,
  getUrgencyLevel,
  getUrgencyColor,
  getUrgencyText,
  formatDate,
  handleMarkAsPaidTarot,
}) => {
  return (
    <div className={`grid gap-6 ${context === 'all' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
      {/* PRINCIPAL */}
      {(context === 'principal' || context === 'all') && filteredPayments.principal.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-blue-800">Atendimentos Principais</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentSection
              groupedPayments={filteredPayments.principal}
              title=""
              icon={<Users className="h-5 w-5 text-blue-600" />}
              emptyMessage="Nenhum vencimento de atendimentos principais"
              isPrincipal={true}
              expandedClients={expandedClients}
              toggleExpandClient={toggleExpandClient}
              normalizeClientName={normalizeClientName}
              getDaysUntilDue={getDaysUntilDue}
              getUrgencyLevel={getUrgencyLevel}
              getUrgencyColor={getUrgencyColor}
              getUrgencyText={getUrgencyText}
              formatDate={formatDate}
            />
          </CardContent>
        </Card>
      )}

      {/* TAROT */}
      {(context === 'tarot' || context === 'all') && filteredTarotGroups.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-purple-800">Análises de Tarot</CardTitle>
          </CardHeader>
          <CardContent>
            <TarotPaymentSection 
              groupedPayments={filteredTarotGroups}
              onMarkAsPaid={handleMarkAsPaidTarot}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentModalContent;
