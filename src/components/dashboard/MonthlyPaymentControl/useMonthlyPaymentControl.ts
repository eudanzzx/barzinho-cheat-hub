
import { useState, useEffect } from "react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";
import { useIsMobile } from "@/hooks/use-mobile";

export const useMonthlyPaymentControl = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false); // Sempre começar fechado
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [planos, setPlanos] = useState<PlanoMensal[]>([]);

  console.log("useMonthlyPaymentControl - Mobile:", isMobile, "isOpen:", isOpen);

  // Inicializar fechado sempre, especialmente no mobile
  useEffect(() => {
    setIsOpen(false);
  }, [isMobile]);

  useEffect(() => {
    loadPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      loadPlanos();
    };

    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    window.addEventListener('planosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
      window.removeEventListener('planosUpdated', handlePlanosUpdated);
    };
  }, []);

  const loadPlanos = () => {
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    // Mostrar TODOS os planos mensais (pagos e pendentes) para que não sumam ao pagar
    const monthlyPlanos = allPlanos.filter((plano): plano is PlanoMensal => 
      plano.type === 'plano' && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );

    setPlanos(monthlyPlanos);
  };

  const handlePaymentToggle = (planoId: string, clientName: string, isPaid: boolean) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === planoId ? { ...plano, active: !isPaid } : plano
    );
    
    savePlanos(updatedPlanos);
    toast.success(
      isPaid 
        ? `Pagamento de ${clientName} marcado como pago!`
        : `Pagamento de ${clientName} marcado como pendente!`
    );
    
    setTimeout(() => {
      window.dispatchEvent(new Event('atendimentosUpdated'));
      window.dispatchEvent(new Event('planosUpdated'));
    }, 100);
    
    loadPlanos();
  };

  const toggleClientExpansion = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const groupedPlanos = planos.reduce((acc, plano) => {
    if (!acc[plano.clientName]) {
      acc[plano.clientName] = [];
    }
    acc[plano.clientName].push(plano);
    return acc;
  }, {} as Record<string, PlanoMensal[]>);

  return {
    isOpen,
    setIsOpen,
    expandedClients,
    planos,
    groupedPlanos,
    handlePaymentToggle,
    toggleClientExpansion,
    isMobile
  };
};
