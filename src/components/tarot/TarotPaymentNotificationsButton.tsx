
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, Sparkles } from "lucide-react";
import { ClientPaymentGroup } from "./payment-notifications/ClientPaymentGroup";
import { usePaymentNotifications } from "./payment-notifications/usePaymentNotifications";

const TarotPaymentNotificationsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { groupedPayments, markAsPaid, postponePayment, deleteNotification } = usePaymentNotifications();

  const totalPayments = groupedPayments.reduce((acc, group) => acc + group.totalPayments, 0);

  const handleViewDetails = (payment: any) => {
    console.log('TarotPaymentNotificationsButton - Abrindo detalhes para pagamento:', payment);
    // Disparar evento personalizado para abrir o modal de detalhes
    const event = new CustomEvent('open-payment-details-modal', {
      detail: { payment }
    });
    window.dispatchEvent(event);
    setIsOpen(false); // Fechar o popover
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-slate-600 hover:text-[#6B21A8] hover:bg-[#6B21A8]/10 transition-all duration-200"
          data-notification-button
        >
          <Bell className="h-4 w-4" />
          {totalPayments > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-purple-500 text-white text-xs">
              {totalPayments}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#6B21A8]" />
            <h3 className="font-semibold text-slate-800">Pagamentos do Tarot</h3>
          </div>
          <p className="text-sm text-slate-600">{groupedPayments.length} cliente(s) com {totalPayments} pendencia(s)</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {groupedPayments.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 opacity-30" />
                <Bell className="h-6 w-6 opacity-30" />
              </div>
              <p>Nenhuma notificacao ativa do tarot</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {groupedPayments.map((group) => (
                <ClientPaymentGroup 
                  key={group.clientName}
                  group={group}
                  onMarkAsPaid={markAsPaid}
                  onDeleteNotification={deleteNotification}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TarotPaymentNotificationsButton;

