import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentDetailsModalProps {
  payment: any;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsPaid?: (id: string) => void;
  onDeleteNotification?: (id: string) => void;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  payment,
  isOpen,
  onClose,
  onMarkAsPaid,
  onDeleteNotification,
}) => {
  console.log('PaymentDetailsModal render - payment:', payment, 'isOpen:', isOpen);
  
  if (!payment) {
    console.log('PaymentDetailsModal: No payment data, returning null');
    return null;
  }

  const dueDate = parseISO(payment.dueDate);
  const today = new Date();
  const daysOverdue = differenceInDays(today, dueDate);
  const isOverdue = daysOverdue > 0;
  const isDueSoon = daysOverdue >= -3 && daysOverdue <= 0;

  const getStatusBadge = () => {
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {daysOverdue} dias em atraso
        </Badge>
      );
    }
    if (isDueSoon) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-700">
          <Clock className="h-3 w-3 mr-1" />
          Vence em {Math.abs(daysOverdue)} dias
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Calendar className="h-3 w-3 mr-1" />
        No prazo
      </Badge>
    );
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            Detalhes do Pagamento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {payment.clientName}
                </div>
                {getStatusBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">
                    {payment.type === 'plano' ? 'Plano Mensal' : 'Plano Semanal'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(payment.amount || payment.value || 0)}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                <p className="font-medium">
                  {format(dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              
              {payment.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="text-sm">{payment.description}</p>
                </div>
              )}
              
              {payment.monthNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Parcela</p>
                  <p className="text-sm">{payment.monthNumber}ª parcela</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex gap-2">
            {onMarkAsPaid && (
              <Button 
                onClick={() => {
                  onMarkAsPaid(payment.id);
                  onClose();
                }}
                className="flex-1"
                variant="default"
              >
                Marcar como Pago
              </Button>
            )}
            {onDeleteNotification && (
              <Button 
                onClick={() => {
                  onDeleteNotification(payment.id);
                  onClose();
                }}
                variant="outline"
                className="flex-1"
              >
                Remover Notificação
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsModal;