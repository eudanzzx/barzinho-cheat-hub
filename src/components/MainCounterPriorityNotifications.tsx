
import React, { memo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useUserDataService from "@/services/userDataService";
import { MainClientPaymentGroup } from "@/components/main-payment-notifications/MainClientPaymentGroup";
import { filterMainPlans } from "@/components/main-payment-notifications/utils/mainPlanFilters";
import { groupPaymentsByClient } from "@/components/tarot/payment-notifications/utils/paymentGrouping";

interface MainCounterPriorityNotificationsProps {
  atendimentos: any[];
}

const MainCounterPriorityNotifications: React.FC<MainCounterPriorityNotificationsProps> = memo(({
  atendimentos,
}) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [groupedPayments, setGroupedPayments] = useState<any[]>([]);

  useEffect(() => {
    const loadMainPayments = () => {
      const allPlanos = getPlanos();
      const existingClientNames = new Set(atendimentos.map(a => a.nome));
      
      const mainPlans = filterMainPlans(allPlanos, existingClientNames);
      const grouped = groupPaymentsByClient(mainPlans);
      
      setGroupedPayments(grouped);
    };

    loadMainPayments();
    
    const handlePaymentUpdate = () => {
      loadMainPayments();
    };
    
    window.addEventListener('planosUpdated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('planosUpdated', handlePaymentUpdate);
    };
  }, [getPlanos, atendimentos]);

  const markAsPaid = (paymentId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => {
      if (plano.id === paymentId) {
        return { ...plano, active: false };
      }
      return plano;
    });
    
    savePlanos(updatedPlanos);
    
    setTimeout(() => {
      window.dispatchEvent(new Event('planosUpdated'));
    }, 100);
  };

  const deleteNotification = (paymentId: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.filter(plano => plano.id !== paymentId);
    savePlanos(updatedPlanos);
    
    setTimeout(() => {
      window.dispatchEvent(new Event('planosUpdated'));
    }, 100);
  };

  if (groupedPayments.length === 0) {
    return (
      <div className="p-4 text-slate-500 text-center">
        <Bell className="h-6 w-6 mx-auto mb-3 opacity-40" />
        Nenhum vencimento de atendimentos pendente
      </div>
    );
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
        {groupedPayments.map((group) => (
          <MainClientPaymentGroup
            key={group.clientName}
            group={group}
            onMarkAsPaid={markAsPaid}
            onDeleteNotification={deleteNotification}
          />
        ))}
      </CardContent>
    </Card>
  );
});

MainCounterPriorityNotifications.displayName = 'MainCounterPriorityNotifications';

export default MainCounterPriorityNotifications;
