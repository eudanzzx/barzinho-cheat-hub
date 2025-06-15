
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePaymentNotifications } from "@/components/tarot/payment-notifications/usePaymentNotifications";
import { ClientPaymentGroup } from "@/components/tarot/payment-notifications/ClientPaymentGroup";

interface TarotCounterPriorityNotificationsProps {
  analises: any[];
}

const TarotCounterPriorityNotifications: React.FC<TarotCounterPriorityNotificationsProps> = ({
  analises,
}) => {
  console.log('TarotCounterPriorityNotifications - Verificando contadores para:', analises.length, 'análises');

  const { groupedPayments, markAsPaid, postponePayment, deleteNotification } = usePaymentNotifications();

  console.log('TarotCounterPriorityNotifications - Grupos de pagamento:', groupedPayments.length);

  if (groupedPayments.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Bell className="h-5 w-5" />
          Próximos Vencimentos - Análises de Tarot
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {groupedPayments.length} {groupedPayments.length === 1 ? 'cliente' : 'clientes'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groupedPayments.map((group) => (
          <ClientPaymentGroup
            key={group.clientName}
            group={group}
            onMarkAsPaid={markAsPaid}
            onPostponePayment={postponePayment}
            onDeleteNotification={deleteNotification}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default TarotCounterPriorityNotifications;
