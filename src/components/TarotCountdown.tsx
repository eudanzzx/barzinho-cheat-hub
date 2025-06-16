
import React, { useState, useEffect, useMemo, memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface TarotCountdownProps {
  analises: any[];
}

const TarotCountdown: React.FC<TarotCountdownProps> = memo(({ analises }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 600000); // Atualizar a cada 10 minutos para reduzir carga
    return () => clearInterval(interval);
  }, []);

  const expiringAnalyses = useMemo(() => {
    if (!analises.length) return [];
    
    const now = currentTime;
    const expiring = [];

    // Otimizar iteração limitando verificações
    for (let i = 0; i < Math.min(analises.length, 20); i++) {
      const analise = analises[i];
      const clientName = analise.nomeCliente || analise.clientName;
      
      if (analise.lembretes && Array.isArray(analise.lembretes) && analise.lembretes.length > 0) {
        for (const lembrete of analise.lembretes.slice(0, 3)) { // Limitar lembretes por análise
          if (lembrete.dataLembrete && !lembrete.concluido) {
            const lembreteDate = new Date(lembrete.dataLembrete);
            const timeDiff = lembreteDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysDiff <= 3 && daysDiff >= 0) {
              expiring.push({
                nomeCliente: clientName,
                diasRestantes: daysDiff,
                lembreteTexto: lembrete.texto || "Lembrete programado",
                dataLembrete: lembreteDate
              });
            }
          } else if (lembrete.dias && analise.dataInicio && lembrete.texto) {
            const dataInicio = new Date(analise.dataInicio);
            const dataExpiracao = new Date(dataInicio);
            dataExpiracao.setDate(dataExpiracao.getDate() + parseInt(lembrete.dias));
            
            const timeDiff = dataExpiracao.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysDiff <= 3 && daysDiff >= 0) {
              expiring.push({
                nomeCliente: clientName,
                diasRestantes: daysDiff,
                lembreteTexto: lembrete.texto,
                dataLembrete: dataExpiracao
              });
            }
          }
        }
      }
    }

    return expiring.slice(0, 3); // Limitar a 3 para melhor performance
  }, [analises, currentTime]);

  const formatTimeRemaining = useCallback((days: number) => {
    if (days === 0) return "Hoje";
    if (days === 1) return "1 dia";
    return `${days} dias`;
  }, []);

  if (expiringAnalyses.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {expiringAnalyses.map((item, index) => (
        <Card 
          key={`${item.nomeCliente}-${index}`}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-md"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  {item.diasRestantes === 0 ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">
                    {item.nomeCliente}
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {item.lembreteTexto}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={item.diasRestantes === 0 ? "destructive" : "secondary"}
                  className="bg-amber-100 text-amber-700"
                >
                  {formatTimeRemaining(item.diasRestantes)}
                </Badge>
                <p className="text-xs text-amber-600 mt-1">
                  {item.dataLembrete.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

TarotCountdown.displayName = 'TarotCountdown';

export default TarotCountdown;
