
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Home, Eye } from "lucide-react";
import { MainClientPaymentGroupNew } from "@/components/main-payment-notifications/MainClientPaymentGroupNew";
import { useMainPaymentNotifications } from "@/hooks/useMainPaymentNotifications";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

interface MainPaymentNotificationsButtonProps {
  atendimentos: any[];
}

const MainPaymentNotificationsButton: React.FC<MainPaymentNotificationsButtonProps> = ({ atendimentos }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { groupedPayments, markAsPaid, deleteNotification } = useMainPaymentNotifications();
  const { mainNotificationsMuted, toggleMainNotifications } = useNotificationSettings();

  const totalPayments = groupedPayments.reduce((acc, group) => acc + group.totalPayments, 0);

  const handleViewDetails = (payment: any) => {
    console.log('MainPaymentNotificationsButton - Abrindo detalhes para pagamento:', payment);
    const event = new CustomEvent('open-payment-details-modal', {
      detail: { payment }
    });
    window.dispatchEvent(event);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-slate-600 hover:text-[#0553C7] hover:bg-[#0553C7]/10 transition-all duration-200"
          data-notification-button
        >
          {mainNotificationsMuted ? (
            <BellOff className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {!mainNotificationsMuted && totalPayments > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white text-xs">
              {totalPayments}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-sky-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-[#0553C7]" />
              <h3 className="font-semibold text-slate-800">Pagamentos Principais</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMainNotifications}
              className="h-8 w-8 p-0"
              title={mainNotificationsMuted ? "Ativar notificações" : "Silenciar notificações"}
            >
              {mainNotificationsMuted ? (
                <BellOff className="h-4 w-4 text-slate-500" />
              ) : (
                <Bell className="h-4 w-4 text-[#0553C7]" />
              )}
            </Button>
          </div>
          <p className="text-sm text-slate-600">
            {mainNotificationsMuted 
              ? "Notificações silenciadas" 
              : `${groupedPayments.length} cliente(s) com ${totalPayments} pendencia(s)`
            }
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {mainNotificationsMuted ? (
            <div className="p-4 text-center text-slate-500">
              <div className="flex justify-center items-center gap-2 mb-2">
                <BellOff className="h-6 w-6 opacity-30" />
                <Home className="h-6 w-6 opacity-30" />
              </div>
              <p>Notificações silenciadas</p>
              <p className="text-xs mt-1">Clique no sino acima para reativar</p>
            </div>
          ) : groupedPayments.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Home className="h-6 w-6 opacity-30" />
                <Bell className="h-6 w-6 opacity-30" />
              </div>
              <p>Nenhuma notificação ativa</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {groupedPayments.map((group) => (
                <MainClientPaymentGroupNew 
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

export default MainPaymentNotificationsButton;
