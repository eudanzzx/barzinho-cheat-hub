
import React, { memo, useState, useEffect } from "react";
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

  console.log('TarotCounterPriorityNotifications - Renderizado com:', {
    analisesCount: analises?.length || 0,
    groupedPaymentsCount: groupedPayments?.length || 0,
    currentPath: location.pathname
  });

  // Adicionar sincronização com controle de pagamentos
  useEffect(() => {
    const handleSyncUpdate = () => {
      console.log('TarotCounterPriorityNotifications - Sincronizando com controle de pagamentos');
      // Forçar refresh das notificações
      setTimeout(() => {
        window.dispatchEvent(new Event('tarot-payment-updated'));
      }, 100);
    };

    const events = ['planosUpdated', 'atendimentosUpdated', 'paymentStatusChanged'];
    events.forEach(event => {
      window.addEventListener(event, handleSyncUpdate);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleSyncUpdate);
      });
    };
  }, []);

  // Log para debug dos pagamentos agrupados
  useEffect(() => {
    if (groupedPayments.length > 0) {
      console.log('TarotCounterPriorityNotifications - Pagamentos encontrados:', {
        totalGroups: groupedPayments.length,
        firstGroup: groupedPayments[0],
        allGroups: groupedPayments
      });
    } else {
      console.log('TarotCounterPriorityNotifications - Nenhum pagamento encontrado');
    }
  }, [groupedPayments]);

  const handleViewDetails = (payment: any) => {
    console.log('TarotCounterPriorityNotifications - handleViewDetails called with payment:', payment);
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  // Só mostrar notificações de tarot nas páginas de tarot
  const isTarotPage = location.pathname.includes('listagem-tarot') || 
                      location.pathname.includes('analise-frequencial') || 
                      location.pathname.includes('editar-analise-frequencial') ||
                      location.pathname.includes('relatorio-geral-tarot') ||
                      location.pathname.includes('relatorio-individual-tarot');
  
  if (!isTarotPage) {
    console.log('TarotCounterPriorityNotifications - Não é página de tarot, não renderizando');
    return null;
  }

  // Se não há notificações pendentes, mostrar mensagem de debug
  if (groupedPayments.length === 0) {
    console.log('TarotCounterPriorityNotifications - Nenhuma notificação pendente');
    return (
      <Card className="mb-6 border-tarot-primary bg-tarot-accent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 tarot-primary">
            <Bell className="h-5 w-5" />
            Próximos Vencimentos - Análises de Tarot
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              0 clientes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Nenhum vencimento de análises de tarot encontrado. 
            {analises?.length === 0 && " (Nenhuma análise cadastrada)"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const paymentsToShow = groupedPayments;

  return (
    <Card className="mb-6 border-tarot-primary bg-tarot-accent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 tarot-primary">
          <Bell className="h-5 w-5" />
          Próximos Vencimentos - Análises de Tarot
          <Badge variant="secondary" className="bg-tarot-primary text-white">
            {paymentsToShow.length} {paymentsToShow.length === 1 ? 'cliente' : 'clientes'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentsToShow.map((group, index) => (
          <ClientPaymentGroup
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

TarotCounterPriorityNotifications.displayName = 'TarotCounterPriorityNotifications';

export default TarotCounterPriorityNotifications;
