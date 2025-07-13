
import { toast } from "sonner";

export const useDataCleanupService = () => {
  
  const clearAllData = () => {
    try {
      console.log('Iniciando limpeza completa dos dados...');
      
      // Limpar localStorage
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
        console.log(`Removido: ${key}`);
      });
      
      // Disparar todos os eventos de sincronização para atualizar a UI
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
        console.log(`Evento disparado: ${eventName}`);
      });
      
      // Forçar reload da página após um pequeno delay para garantir sincronização
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      toast.success('Todos os dados foram removidos com sucesso!');
      console.log('Limpeza completa finalizada');
      
    } catch (error) {
      console.error('Erro durante limpeza dos dados:', error);
      toast.error('Erro ao limpar os dados');
    }
  };

  return {
    clearAllData
  };
};
