
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from 'lucide-react';

interface PaymentModalHeaderProps {
  context: 'principal' | 'tarot' | 'all';
}

const PaymentModalHeader: React.FC<PaymentModalHeaderProps> = ({ context }) => {
  const getModalTitle = () => {
    switch (context) {
      case 'principal':
        return 'Próximos Vencimentos - Atendimentos Principais';
      case 'tarot':
        return 'Próximos Vencimentos - Análises de Tarot';
      default:
        return 'Próximos Vencimentos';
    }
  };

  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-xl">
        <Calendar className="h-5 w-5 text-blue-600" />
        {getModalTitle()}
      </DialogTitle>
      <DialogDescription>
        Visualize e gerencie os próximos vencimentos de pagamentos.
      </DialogDescription>
    </DialogHeader>
  );
};

export default PaymentModalHeader;
