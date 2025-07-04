import { useState, useEffect } from "react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";
import { useIsMobile } from "@/hooks/use-mobile";

export const useMonthlyPaymentControl = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [planos, setPlanos] = useState<PlanoMensal[]>([]);

  console.log("useMonthlyPaymentControl - Mobile:", isMobile, "isOpen:", isOpen, "planos:", planos.length);

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
    
    // Mostrar TODOS os planos mensais (pagos E pendentes) - removido filtro .active
    const monthlyPlanos = allPlanos.filter((plano): plano is PlanoMensal => 
      plano.type === 'plano' && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );

    console.log("useMonthlyPaymentControl - Planos carregados:", monthlyPlanos.length);
    console.log("useMonthlyPaymentControl - Planos detalhados:", monthlyPlanos.map(p => ({ 
      id: p.id, 
      client: p.clientName, 
      active: p.active, 
      month: p.month 
    })));
    setPlanos(monthlyPlanos);
  };

  const handlePaymentToggle = (planoId: string, clientName: string, isPaid: boolean) => {
    console.log("useMonthlyPaymentControl - Toggle pagamento:", { planoId, clientName, isPaid });
    
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === planoId ? { ...plano, active: !isPaid } : plano
    );
    
    savePlanos(updatedPlanos);
    toast.success(
      isPaid 
        ? `Pagamento de ${clientName} marcado como pendente!`
        : `Pagamento de ${clientName} marcado como pago!`
    );
    
    // Recarregar os dados e disparar eventos para sincronização
    setTimeout(() => {
      window.dispatchEvent(new Event('atendimentosUpdated'));
      window.dispatchEvent(new Event('planosUpdated'));
      window.dispatchEvent(new Event('monthlyPaymentsUpdated'));
      loadPlanos();
    }, 100);
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
