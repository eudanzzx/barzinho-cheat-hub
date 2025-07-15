
import { Plano } from "@/types/payment";

export const usePlanoService = () => {
  const getPlanos = (): Plano[] => {
    try {
      const data = localStorage.getItem("planos");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  };

  const savePlanos = (planos: Plano[]) => {
    try {
      localStorage.setItem("planos", JSON.stringify(planos));
      
      window.dispatchEvent(new CustomEvent('planosUpdated', {
        detail: { timestamp: Date.now(), total: planos.length }
      }));
    } catch (error) {
      // Silent fail
    }
  };

  return {
    getPlanos,
    savePlanos,
  };
};
