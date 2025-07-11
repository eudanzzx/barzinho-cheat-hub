
import React, { memo, useState, useEffect } from "react";
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

  // Escutar evento para abrir modal de detalhes
  useEffect(() => {
    const handleOpenPaymentDetailsModal = (event: CustomEvent) => {
      console.log('Abrindo modal de detalhes para pagamento:', event.detail.payment);
      setSelectedPayment(event.detail.payment);
      setIsModalOpen(true);
    };

    window.addEventListener('open-payment-details-modal', handleOpenPaymentDetailsModal as EventListener);
    
    return () => {
      window.removeEventListener('open-payment-details-modal', handleOpenPaymentDetailsModal as EventListener);
    };
  }, []);

  // Se não há notificações pendentes, não mostrar o componente
  if (groupedPayments.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bell className="h-5 w-5" />
          Próximos Vencimentos - Atendimentos
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
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
