
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BellRing } from 'lucide-react';

interface CounterCardProps {
  notification: {
    nomeCliente: string;
    lembreteTexto: string;
    diasRestantes: number;
    dataExpiracao: Date;
  };
  urgencyLevel: string;
  cardStyle: string;
  timeFormatted: string;
}

const CounterCard: React.FC<CounterCardProps> = ({
  notification,
  urgencyLevel,
  cardStyle,
  timeFormatted
}) => {
  return (
    <Card className={`${cardStyle} shadow-md hover:shadow-lg transition-shadow duration-200`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <BellRing className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-purple-800">
                {notification.nomeCliente}
              </h4>
              <p className="text-sm text-purple-700">
                {notification.lembreteTexto}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="bg-purple-100 text-purple-700">
              {timeFormatted}
            </Badge>
            <p className="text-xs text-purple-600 mt-1">
              {notification.dataExpiracao.toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CounterCard;
