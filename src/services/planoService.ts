
import { Plano } from "@/types/payment";

export const usePlanoService = () => {
  const getPlanos = (): Plano[] => {
    try {
      const data = localStorage.getItem("planos");
      const planos = data ? JSON.parse(data) : [];
      console.log('getPlanos - Retornando:', planos.length, 'planos');
      return planos;
    } catch (error) {
      console.error('getPlanos - Erro ao buscar planos:', error);
      return [];
    }
  };

  const savePlanos = (planos: Plano[]) => {
    try {
      localStorage.setItem("planos", JSON.stringify(planos));
      console.log('savePlanos - Salvos:', planos.length, 'planos');
      
      // Disparar evento para notificar mudanças
      window.dispatchEvent(new Event('planosUpdated'));
    } catch (error) {
      console.error('savePlanos - Erro ao salvar planos:', error);
    }
  };

  return {
    getPlanos,
    savePlanos,
  };
};
