import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TarotCountdownProps {
  analise: any;
  onTimeUp: () => void;
}

interface StatusInfo {
  label: string;
  color: string;
  icon: React.ReactNode;
}

const calculateTimeLeft = (endTime: string | number | Date) => {
  const difference = new Date(endTime).getTime() - new Date().getTime();
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

const TarotCountdown: React.FC<TarotCountdownProps> = React.memo(({ 
  analise, 
  onTimeUp 
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(analise.endTime));
  const totalTimeInSeconds = useMemo(() => {
    const endDate = new Date(analise.endTime).getTime();
    const startDate = new Date(analise.startTime).getTime();
    return (endDate - startDate) / 1000;
  }, [analise.endTime, analise.startTime]);

  useEffect(() => {
    if (!analise.endTime) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(analise.endTime);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        clearInterval(timer);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [analise.endTime, onTimeUp]);

  const formatTime = useCallback((totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
  }, []);

  const getStatusInfo = useCallback((timeLeft: number, totalTime: number) => {
    const remainingPercentage = (timeLeft / totalTime) * 100;

    if (remainingPercentage <= 10) {
      return {
        label: "Urgente",
        color: "text-red-500",
        icon: <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />,
      };
    } else {
      return {
        label: "Em andamento",
        color: "text-blue-500",
        icon: <Clock className="h-4 w-4 mr-1 text-blue-500" />,
      };
    }
  }, []);

  const statusInfo = useMemo(() => 
    getStatusInfo(
      (timeLeft.days * 24 * 60 * 60) + (timeLeft.hours * 60 * 60) + (timeLeft.minutes * 60) + timeLeft.seconds, 
      totalTimeInSeconds
    ), 
    [timeLeft, totalTimeInSeconds, getStatusInfo]
  );

  return (
    <div className="flex items-center gap-2">
      {statusInfo.icon}
      <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
      <Badge variant="secondary" className="bg-white border-gray-200 text-gray-800">
        {formatTime(
          (timeLeft.days * 24 * 60 * 60) + (timeLeft.hours * 60 * 60) + (timeLeft.minutes * 60) + timeLeft.seconds
        )}
      </Badge>
    </div>
  );
});

TarotCountdown.displayName = 'TarotCountdown';

export default TarotCountdown;
