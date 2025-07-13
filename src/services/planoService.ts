
import { Plano } from "@/types/payment";

export const usePlanoService = () => {
  const getPlanos = (): Plano[] => {
    try {
      const data = localStorage.getItem("planos");
      const planos = data ? JSON.parse(data) : [];
      console.log('getPlanos - Retornando:', {
        total: planos.length,
        tarotPlanos: planos.filter(p => p.type === 'plano' || p.type === 'semanal').length,
        activeTarotPlanos: planos.filter(p => (p.type === 'plano' || p.type === 'semanal') && p.active).length
      });
      return planos;
    } catch (error) {
      console.error('getPlanos - Erro ao buscar planos:', error);
      return [];
    }
  };

  const savePlanos = (planos: Plano[]) => {
    try {
      localStorage.setItem("planos", JSON.stringify(planos));
      console.log('savePlanos - Salvos:', {
        total: planos.length,
        tarotPlanos: planos.filter(p => p.type === 'plano' || p.type === 'semanal').length,
        activeTarotPlanos: planos.filter(p => (p.type === 'plano' || p.type === 'semanal') && p.active).length
      });
      
      // Disparar evento para notificar mudanças
      window.dispatchEvent(new CustomEvent('planosUpdated', {
        detail: { timestamp: Date.now(), total: planos.length }
      }));
    } catch (error) {
      console.error('savePlanos - Erro ao salvar planos:', error);
    }
  };

  return {
    getPlanos,
    savePlanos,
  };
};
