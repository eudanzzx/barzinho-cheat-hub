
import React, { useState, useEffect, useMemo } from 'react';
import CounterHeader from './counter-notifications/CounterHeader';
import CounterCard from './counter-notifications/CounterCard';

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
      <CounterHeader notificationCount={notifications.length} />

      {notifications.map((notification, index) => {
        const urgency = getUrgencyLevel(notification);
        const cardStyle = getCardStyle(urgency);
        const timeFormatted = formatTimeRemaining(notification);
        
        return (
          <CounterCard
            key={`${notification.nomeCliente}-${index}`}
            notification={notification}
            urgencyLevel={urgency}
            cardStyle={cardStyle}
            timeFormatted={timeFormatted}
          />
        );
      })}
    </div>
  );
};

export default TarotCounterNotifications;
