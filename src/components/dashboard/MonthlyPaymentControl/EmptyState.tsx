
import React from "react";
import { CreditCard } from "lucide-react";

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12 text-gray-500">
      <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-30" />
      <p className="text-lg">Nenhum pagamento mensal ativo</p>
      <p className="text-sm mt-2">Os pagamentos aparecerão aqui quando houver planos mensais ativos</p>
    </div>
  );
};

export default EmptyState;
