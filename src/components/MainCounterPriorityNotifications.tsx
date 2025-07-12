
import React, { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { MainClientPaymentGroupNew } from "@/components/main-payment-notifications/MainClientPaymentGroupNew";
import PaymentDetailsModal from "@/components/PaymentDetailsModal";
import { useMainPaymentNotifications } from "@/hooks/useMainPaymentNotifications";

interface MainCounterPriorityNotificationsProps {
  atendimentos: any[];
}

const MainCounterPriorityNotifications: React.FC<MainCounterPriorityNotificationsProps> = memo(({
  atendimentos,
}) => {
  const location = useLocation();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    groupedPayments,
    markAsPaid,
    deleteNotification
  } = useMainPaymentNotifications();

  const handleViewDetails = (payment: any) => {
    console.log('MainCounterPriorityNotifications - handleViewDetails called with payment:', payment);
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  // Só mostrar notificações principais na página principal
  const isMainPage = location.pathname === '/';
  
  if (!isMainPage) {
    return null;
  }


  // Se não há notificações pendentes, não mostrar o componente
  if (groupedPayments.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-main-primary bg-main-accent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 main-primary">
          <Bell className="h-5 w-5" />
          Próximos Vencimentos - Atendimentos
          <Badge variant="secondary" className="bg-main-primary text-white">
            {groupedPayments.length} {groupedPayments.length === 1 ? 'cliente' : 'clientes'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groupedPayments.map((group, index) => (
          <MainClientPaymentGroupNew
            key={`${group.clientName}-${group.mostUrgent.id}-${index}`}
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

MainCounterPriorityNotifications.displayName = 'MainCounterPriorityNotifications';

export default MainCounterPriorityNotifications;
