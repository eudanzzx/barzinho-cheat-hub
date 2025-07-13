
import React, { memo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const { groupedPayments, markAsPaid, deleteNotification, refresh } = usePaymentNotifications();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  console.log('TarotCounterPriorityNotifications - Renderizado com:', {
    analisesCount: analises?.length || 0,
    groupedPaymentsCount: groupedPayments?.length || 0,
    currentPath: location.pathname,
    lastRefresh: new Date(lastRefresh).toISOString()
  });

  // Sincronização melhorada com controle de pagamentos
  useEffect(() => {
    const handleSyncUpdate = (event?: CustomEvent) => {
      console.log('TarotCounterPriorityNotifications - Evento de sincronização recebido:', event?.detail);
      setTimeout(() => {
        refresh();
        setLastRefresh(Date.now());
      }, 100);
    };

    const events = [
      'planosUpdated', 
      'atendimentosUpdated', 
      'paymentStatusChanged',
      'tarot-payment-updated',
      'monthlyPaymentsUpdated',
      'payment-notifications-cleared'
    ];
    
    events.forEach(event => {
      window.addEventListener(event, handleSyncUpdate as EventListener);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleSyncUpdate as EventListener);
      });
    };
  }, [refresh]);

  // Log para debug dos pagamentos agrupados
  useEffect(() => {
    if (groupedPayments.length > 0) {
      console.log('TarotCounterPriorityNotifications - Pagamentos encontrados:', {
        totalGroups: groupedPayments.length,
        firstGroup: groupedPayments[0],
        allGroups: groupedPayments.map(g => ({
          clientName: g.clientName,
          totalPayments: g.totalPayments,
          mostUrgentDueDate: g.mostUrgent.dueDate,
          mostUrgentAmount: g.mostUrgent.amount
        }))
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

  const handleRefresh = () => {
    console.log('TarotCounterPriorityNotifications - Refresh manual solicitado');
    refresh();
    setLastRefresh(Date.now());
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

  const totalPayments = groupedPayments.reduce((acc, group) => acc + group.totalPayments, 0);

  return (
    <Card className="mb-6 border-tarot-primary bg-tarot-accent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 tarot-primary">
          <Bell className="h-5 w-5" />
          Próximos Vencimentos - Análises de Tarot
          <Badge variant="secondary" className={`${totalPayments > 0 ? 'bg-tarot-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
            {totalPayments} {totalPayments === 1 ? 'vencimento' : 'vencimentos'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="ml-auto h-8 w-8 p-0 hover:bg-tarot-primary/10"
            title="Atualizar notificações"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groupedPayments.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30 tarot-primary" />
            <p className="text-sm text-gray-500">
              Nenhum vencimento de análises de tarot encontrado.
              {analises?.length === 0 && " (Nenhuma análise cadastrada)"}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Última verificação: {new Date(lastRefresh).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        ) : (
          <>
            {groupedPayments.map((group, index) => (
              <ClientPaymentGroup
                key={`${group.clientName}-${group.mostUrgent.id}-${index}`}
                group={group}
                onMarkAsPaid={markAsPaid}
                onDeleteNotification={deleteNotification}
                onViewDetails={handleViewDetails}
              />
            ))}
            <div className="text-xs text-gray-400 text-center pt-2 border-t">
              Última atualização: {new Date(lastRefresh).toLocaleTimeString('pt-BR')}
            </div>
          </>
        )}
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
