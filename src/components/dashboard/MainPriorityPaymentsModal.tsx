
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainClientPaymentGroupNew } from "@/components/main-payment-notifications/MainClientPaymentGroupNew";
import PaymentDetailsModal from "@/components/PaymentDetailsModal";
import { useMainPaymentNotifications } from "@/hooks/useMainPaymentNotifications";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MainPriorityPaymentsModalProps {
  atendimentos: any[];
}

const MainPriorityPaymentsModal: React.FC<MainPriorityPaymentsModalProps> = ({ atendimentos }) => {
  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    groupedPayments,
    markAsPaid,
    deleteNotification
  } = useMainPaymentNotifications();

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-main-primary bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-xl font-bold shadow border border-blue-200 transition-all text-base"
        >
          <Bell className="h-5 w-5 text-[#0ea5e9] mr-1" />
          Próximos Vencimentos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 px-2 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-blue-800 text-sm sm:text-base">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Próximos Vencimentos - Atendimentos</span>
            <span className="sm:hidden">Vencimentos</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-2 sm:px-6 pb-2 sm:pb-6">
          {groupedPayments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Nenhum vencimento pendente
                </h3>
                <p className="text-sm text-gray-500">
                  Todos os pagamentos estão em dia!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-main-primary bg-main-accent">
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
            </Card>
          )}
        </div>
        
        <PaymentDetailsModal
          payment={selectedPayment}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onMarkAsPaid={markAsPaid}
          onDeleteNotification={deleteNotification}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MainPriorityPaymentsModal;
