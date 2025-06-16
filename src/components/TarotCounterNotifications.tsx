
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BellRing } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface TarotCounterNotificationsProps {
  analises: any[];
}

const TarotCounterNotifications: React.FC<TarotCounterNotificationsProps> = ({ analises }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  // Simplificar verificação de contadores para melhorar performance
  const processedNotifications = useMemo(() => {
    if (!analises.length) return [];
    
    const now = new Date();
    const clientCounters: { [key: string]: any } = {};

    analises.forEach(analise => {
      if (!analise.lembretes?.length || !analise.dataInicio) return;
      
      analise.lembretes.forEach((lembrete: any) => {
        if (!lembrete.texto || !lembrete.dias) return;
        
        const dataInicio = new Date(analise.dataInicio);
        const dataExpiracao = new Date(dataInicio);
        dataExpiracao.setDate(dataExpiracao.getDate() + parseInt(lembrete.dias));
        
        const timeDiff = dataExpiracao.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (timeDiff >= 0) {
          const notification = {
            nomeCliente: analise.nomeCliente,
            lembreteTexto: lembrete.texto,
            diasRestantes: daysDiff,
            dataExpiracao: dataExpiracao,
            timeDiff: timeDiff
          };

          if (!clientCounters[analise.nomeCliente] || timeDiff < clientCounters[analise.nomeCliente].timeDiff) {
            clientCounters[analise.nomeCliente] = notification;
          }
        }
      });
    });

    return Object.values(clientCounters)
      .sort((a: any, b: any) => a.timeDiff - b.timeDiff)
      .slice(0, 5); // Limitar a 5 para melhor performance
  }, [analises]);

  useEffect(() => {
    setNotifications(processedNotifications);
  }, [processedNotifications]);

  const formatTimeRemaining = (notification: any) => {
    if (notification.diasRestantes === 0) return "Hoje";
    if (notification.diasRestantes === 1) return "1 dia";
    return `${notification.diasRestantes} dias`;
  };

  const getUrgencyLevel = (notification: any) => {
    if (notification.diasRestantes === 0) return 'critical';
    if (notification.diasRestantes <= 1) return 'urgent';
    if (notification.diasRestantes <= 3) return 'warning';
    return 'normal';
  };

  const getCardStyle = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return "bg-gradient-to-r from-red-50 to-red-100 border-red-300";
      case 'urgent':
        return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300";
      case 'warning':
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300";
      default:
        return "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-800">
          Contadores Ativos ({notifications.length})
        </h3>
      </div>

      {notifications.map((notification, index) => {
        const urgency = getUrgencyLevel(notification);
        
        return (
          <Card 
            key={`${notification.nomeCliente}-${index}`}
            className={`${getCardStyle(urgency)} shadow-md hover:shadow-lg transition-shadow duration-200`}
          >
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
                    {formatTimeRemaining(notification)}
                  </Badge>
                  <p className="text-xs text-purple-600 mt-1">
                    {notification.dataExpiracao.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TarotCounterNotifications;
