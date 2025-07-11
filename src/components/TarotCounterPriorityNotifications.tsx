
import React, { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePaymentNotifications } from "@/components/tarot/payment-notifications/usePaymentNotifications";
import { ClientPaymentGroup } from "@/components/tarot/payment-notifications/ClientPaymentGroup";
import { useLocation } from "react-router-dom";
import PaymentDetailsModal from "@/components/PaymentDetailsModal";

interface TarotCounterPriorityNotificationsProps {
  analises: any[];
}

const TarotCounterPriorityNotifications: React.FC<TarotCounterPriorityNotificationsProps> = memo(({
  analises,
}) => {
  const location = useLocation();
  const { groupedPayments, markAsPaid, deleteNotification } = usePaymentNotifications();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Só mostrar notificações de tarot nas páginas de tarot
  const isTarotPage = location.pathname.includes('listagem-tarot') || 
                      location.pathname.includes('analise-frequencial') || 
                      location.pathname.includes('editar-analise-frequencial') ||
                      location.pathname.includes('relatorio-geral-tarot') ||
                      location.pathname.includes('relatorio-individual-tarot');
  
  if (!isTarotPage || groupedPayments.length === 0) {
    return null;
  }

  const handleViewDetails = (payment: any) => {
    console.log('handleViewDetails called with payment:', payment);
    console.log('Setting modal state - payment:', payment, 'opening modal...');
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

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
            key={`${group.clientName}-${group.mostUrgent.id}`}
            group={group}
            onMarkAsPaid={markAsPaid}
            onDeleteNotification={deleteNotification}
            onViewDetails={handleViewDetails}
          />
        ))}
      </CardContent>
      
      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMarkAsPaid={markAsPaid}
        onDeleteNotification={deleteNotification}
      />
    </Card>
  );
});

TarotCounterPriorityNotifications.displayName = 'TarotCounterPriorityNotifications';

export default TarotCounterPriorityNotifications;
