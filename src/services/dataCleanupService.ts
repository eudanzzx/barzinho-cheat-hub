
import { toast } from "sonner";

export const useDataCleanupService = () => {
  
  const clearAllData = () => {
    try {
      const keysToRemove = [
        'atendimentos',
        'analises', 
        'planos',
        'tarot-analyses',
        'monthly-payments',
        'weekly-payments',
        'payment-notifications',
        'tarot-payment-notifications'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      const syncEvents = [
        'tarotAnalysesUpdated',
        'planosUpdated', 
        'atendimentosUpdated',
        'tarot-payment-updated',
        'main-payment-updated',
        'paymentStatusChanged',
        'monthlyPaymentsUpdated',
        'weeklyPaymentsUpdated',
        'payment-notifications-cleared'
      ];
      
      syncEvents.forEach(eventName => {
        const event = new CustomEvent(eventName, {
          detail: { 
            action: 'data_cleanup',
            timestamp: Date.now(),
            cleared: true
          }
        });
        window.dispatchEvent(event);
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      toast.success('Todos os dados foram removidos com sucesso!');
      
    } catch (error) {
      toast.error('Erro ao limpar os dados');
    }
  };

  return {
    clearAllData
  };
};
