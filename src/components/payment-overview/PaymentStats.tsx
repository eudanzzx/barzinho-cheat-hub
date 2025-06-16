
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface PaymentStatsProps {
  totalGroups: number;
}

const PaymentStats: React.FC<PaymentStatsProps> = ({ totalGroups }) => {
  if (totalGroups > 0) return null;

  return (
    <Card className="border-slate-200">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            Nenhum plano próximo ao vencimento
          </h3>
          <p className="text-slate-500">
            Não há planos ativos com vencimentos próximos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStats;
