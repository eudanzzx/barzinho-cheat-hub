import React, { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, DollarSign, User, Check, Trash2 } from "lucide-react";

interface PaymentDetailsModalProps {
  payment: any;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsPaid: (id: string) => void;
  onDeleteNotification: (id: string) => void;
}

const OptimizedPaymentDetailsModal: React.FC<PaymentDetailsModalProps> = memo(({
  payment,
  isOpen,
  onClose,
  onMarkAsPaid,
  onDeleteNotification
}) => {
  if (!payment) return null;

  const handleMarkAsPaid = () => {
    onMarkAsPaid(payment.id);
  };

  const handleDeleteNotification = () => {
    onDeleteNotification(payment.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Detalhes do Pagamento
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre o pagamento pendente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <Badge variant={payment.status === 'pendente' ? 'destructive' : 'default'}>
              {payment.status}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">Cliente:</span> {payment.clientName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">Data de Vencimento:</span>{' '}
                {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">Valor:</span> R$ {payment.value?.toFixed(2)}
              </span>
            </div>

            {payment.planType && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Tipo:</span> {payment.planType}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button
              onClick={handleMarkAsPaid}
              className="flex-1"
              size="sm"
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar como Pago
            </Button>
            
            <Button
              onClick={handleDeleteNotification}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

OptimizedPaymentDetailsModal.displayName = 'OptimizedPaymentDetailsModal';

export default OptimizedPaymentDetailsModal;