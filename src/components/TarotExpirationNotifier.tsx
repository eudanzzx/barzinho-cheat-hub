
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import useUserDataService from '@/services/userDataService';

const TarotExpirationNotifier: React.FC = () => {
  const { getAllTarotAnalyses } = useUserDataService();

  useEffect(() => {
    const checkExpiredAnalyses = () => {
      const now = new Date();
      const analises = getAllTarotAnalyses();
      
      analises.forEach((analise: any) => {
        // Pular análises finalizadas
        if (analise.finalizado) return;
        
        if (analise.lembretes && Array.isArray(analise.lembretes) && analise.lembretes.length > 0 && analise.dataInicio) {
          analise.lembretes.forEach((lembrete: any) => {
            if (lembrete.texto && lembrete.dias) {
              const dataInicio = new Date(analise.dataInicio);
              const dataExpiracao = new Date(dataInicio);
              dataExpiracao.setDate(dataExpiracao.getDate() + parseInt(lembrete.dias));
              
              const timeDiff = dataExpiracao.getTime() - now.getTime();
              const diasRestantes = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
              
              // Se venceu (diasRestantes <= 0)
              if (diasRestantes <= 0) {
                const diasVencidos = Math.abs(diasRestantes);
                toast.error(
                  `Tratamento "${lembrete.texto}" para ${analise.nomeCliente} venceu há ${diasVencidos} dia${diasVencidos > 1 ? 's' : ''}!`,
                  { 
                    duration: 8000,
                    position: 'top-right'
                  }
                );
              }
              // Se vence hoje ou amanhã
              else if (diasRestantes <= 1) {
                const mensagem = diasRestantes === 1 
                  ? `Tratamento "${lembrete.texto}" para ${analise.nomeCliente} vence amanhã!`
                  : `Tratamento "${lembrete.texto}" para ${analise.nomeCliente} vence hoje!`;
                  
                toast.warning(mensagem, { 
                  duration: 6000,
                  position: 'top-right'
                });
              }
            }
          });
        }
      });
    };

    // Verificar imediatamente quando o componente monta
    const timeoutId = setTimeout(checkExpiredAnalyses, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [getAllTarotAnalyses]);

  return null; // Componente não renderiza nada visualmente
};

export default TarotExpirationNotifier;
