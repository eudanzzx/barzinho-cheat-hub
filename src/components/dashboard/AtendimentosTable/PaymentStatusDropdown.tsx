import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, X, Clock } from "lucide-react";

interface PaymentStatusDropdownProps {
  atendimentoId: string;
  onUpdateStatus: (id: string, status: 'pago' | 'pendente' | 'parcelado') => void;
}

const PaymentStatusDropdown = memo<PaymentStatusDropdownProps>(({ 
  atendimentoId, 
  onUpdateStatus 
}) => {
  const handleStatusChange = useCallback((status: 'pago' | 'pendente' | 'parcelado') => {
    onUpdateStatus(atendimentoId, status);
  }, [atendimentoId, onUpdateStatus]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-xs px-2 py-1 h-6"
        >
          Alterar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('pago')}
          className="text-green-600"
        >
          <Check className="h-3 w-3 mr-2" />
          Marcar como Pago
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('pendente')}
          className="text-yellow-600"
        >
          <Clock className="h-3 w-3 mr-2" />
          Marcar como Pendente
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('parcelado')}
          className="text-red-600"
        >
          <X className="h-3 w-3 mr-2" />
          Marcar como Parcelado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

PaymentStatusDropdown.displayName = 'PaymentStatusDropdown';

export default PaymentStatusDropdown;