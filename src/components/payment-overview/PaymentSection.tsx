
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import ClientPaymentGroup from "./ClientPaymentGroup";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

// Definição local do tipo GroupedPayment
interface GroupedPayment {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  totalPayments: number;
}

interface PaymentSectionProps {
  groupedPayments: GroupedPayment[];
  title: string;
  icon: React.ReactNode;
  emptyMessage: string;
  isPrincipal: boolean;
  expandedClients: string[];
  toggleExpandClient: (normalizedClientName: string) => void;
  normalizeClientName: (name: string) => string;
  getDaysUntilDue: (dueDate: string) => number;
  getUrgencyLevel: (daysUntilDue: number) => string;
  getUrgencyColor: (urgencyLevel: string, isPrincipal: boolean) => string;
  getUrgencyText: (daysUntilDue: number) => string;
  formatDate: (dateString: string) => { date: string; time: string };
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  groupedPayments,
  title,
  icon,
  emptyMessage,
  isPrincipal,
  expandedClients,
  toggleExpandClient,
  normalizeClientName,
  getDaysUntilDue,
  getUrgencyLevel,
  getUrgencyColor,
  getUrgencyText,
  formatDate,
}) => {
  const sectionColor = isPrincipal ? 'blue' : 'purple';
  const totalClients = groupedPayments.length;
  const totalPayments = groupedPayments.reduce((acc, group) => acc + group.totalPayments, 0);

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 pb-2 border-b border-${sectionColor}-200`}>
        {icon}
        <h3 className={`text-lg font-semibold text-${sectionColor}-800`}>{title}</h3>
        <div className="ml-auto flex gap-2">
          <Badge variant="secondary" className={`bg-${sectionColor}-100 text-${sectionColor}-600 border-${sectionColor}-200`}>
            {totalClients} cliente{totalClients !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary" className={`bg-${sectionColor}-100 text-${sectionColor}-600 border-${sectionColor}-200`}>
            {totalPayments} vencimento{totalPayments !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      {groupedPayments.length === 0 ? (
        <div className="text-center py-6">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500 text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedPayments.map((group) => {
            const normalizedName = normalizeClientName(group.clientName);
            return (
              <ClientPaymentGroup
                key={group.clientName}
                group={group}
                isPrincipal={isPrincipal}
                expanded={expandedClients.includes(normalizedName)}
                onToggleExpand={toggleExpandClient}
                normalizeClientName={normalizeClientName}
                getDaysUntilDue={getDaysUntilDue}
                getUrgencyLevel={getUrgencyLevel}
                getUrgencyColor={getUrgencyColor}
                getUrgencyText={getUrgencyText}
                formatDate={formatDate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentSection;

