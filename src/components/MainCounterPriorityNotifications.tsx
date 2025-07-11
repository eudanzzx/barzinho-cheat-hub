
import React, { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { MainClientPaymentGroup } from "@/components/main-payment-notifications/MainClientPaymentGroup";
import PaymentDetailsModal from "@/components/PaymentDetailsModal";

interface MainCounterPriorityNotificationsProps {
  atendimentos: any[];
}

const MainCounterPriorityNotifications: React.FC<MainCounterPriorityNotificationsProps> = memo(({
  atendimentos,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Só mostrar notificações principais na página principal
  const isMainPage = location.pathname === '/';
  
  if (!isMainPage) {
    return null;
  }

  // Dados de teste para demonstrar o modal funcionando
  const testPayments = [
    {
      id: 'test-1',
      clientName: 'João Silva',
      type: 'plano',
      amount: 200.00,
      dueDate: '2025-07-10T14:00:00Z',
      description: 'Atendimento - Plano Mensal',
      monthNumber: 1
    }
  ];

  // Use dados de teste para demonstrar funcionalidade
  const paymentsToShow = [
    {
      clientName: 'João Silva (Teste)',
      mostUrgent: testPayments[0],
      additionalPayments: []
    }
  ];

  const handleViewDetails = (payment: any) => {
    console.log('handleViewDetails called with payment:', payment);
    console.log('Setting modal state - payment:', payment, 'opening modal...');
    // Redirecionar para a página principal
    navigate('/');
  };

  const markAsPaid = (paymentId: string) => {
    console.log('Marking payment as paid:', paymentId);
  };

  const deleteNotification = (paymentId: string) => {
    console.log('Deleting notification:', paymentId);
  };

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bell className="h-5 w-5" />
          Próximos Vencimentos - Atendimentos
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {paymentsToShow.length} {paymentsToShow.length === 1 ? 'cliente' : 'clientes'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentsToShow.map((group, index) => (
          <MainClientPaymentGroup
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
