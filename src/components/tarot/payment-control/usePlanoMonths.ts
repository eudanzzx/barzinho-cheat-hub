
import { useState, useEffect } from "react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";
import { handleMarkAsPaid } from "@/components/tarot/payment-notifications/utils/paymentActions";
import { initializePlanoData } from "./usePlanoMonths/planoInitializer";
import { createNewPlano } from "./usePlanoMonths/planoCreator";

interface PlanoMonth {
  month: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  planoId?: string;
}

interface UsePlanoMonthsProps {
  analysisId: string;
  clientName: string;
  planoData: {
    meses: string;
    valorMensal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

export const usePlanoMonths = ({
  analysisId,
  clientName,
  planoData,
  startDate,
}: UsePlanoMonthsProps) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [planoMonths, setPlanoMonths] = useState<PlanoMonth[]>([]);

  useEffect(() => {
    initializePlanoMonths();
  }, [analysisId, planoData, startDate]);

  // Escutar mudanças nos planos para sincronizar
  useEffect(() => {
    const handlePlanosUpdate = () => {
      console.log('usePlanoMonths - Planos atualizados, reinicializando...');
      setTimeout(() => {
        initializePlanoMonths();
      }, 100);
    };

    const events = ['planosUpdated', 'tarot-payment-updated', 'paymentStatusChanged'];
    events.forEach(event => {
      window.addEventListener(event, handlePlanosUpdate);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handlePlanosUpdate);
      });
    };
  }, []);

  const initializePlanoMonths = () => {
    const totalMonths = parseInt(planoData.meses);
    const baseDate = new Date(startDate);
    const planos = getPlanos();
    
    let dueDay = 5;
    if (planoData.diaVencimento) {
      const parsedDay = parseInt(planoData.diaVencimento);
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        dueDay = parsedDay;
      }
    }
    
    const months = initializePlanoData(
      totalMonths,
      baseDate,
      dueDay,
      planos,
      analysisId,
      clientName
    );
    
    // Garantir que as datas dos planos existentes sejam corrigidas
    const correctedPlanos = planos.map(plano => {
      if (plano.type === 'plano' && 'analysisId' in plano && plano.analysisId === analysisId) {
        const matchingMonth = months.find(m => m.month === plano.month);
        if (matchingMonth && plano.dueDate !== matchingMonth.dueDate) {
          console.log(`Corrigindo data do plano ${plano.id} de ${plano.dueDate} para ${matchingMonth.dueDate}`);
          return { ...plano, dueDate: matchingMonth.dueDate };
        }
      }
      return plano;
    });
    
    if (correctedPlanos.some((p, i) => p !== planos[i])) {
      savePlanos(correctedPlanos);
    }
    
    console.log('usePlanoMonths - Meses inicializados:', {
      totalMonths: months.length,
      paidMonths: months.filter(m => m.isPaid).length,
      analysisId,
      datesGenerated: months.map(m => ({ month: m.month, dueDate: m.dueDate }))
    });
    
    setPlanoMonths(months);
  };

  const handlePaymentToggle = (monthIndex: number) => {
    const month = planoMonths[monthIndex];
    const planos = getPlanos();
    const newIsPaid = !month.isPaid;

    console.log('handlePaymentToggle - Iniciando:', {
      monthIndex,
      month: month.month,
      currentIsPaid: month.isPaid,
      newIsPaid,
      planoId: month.planoId
    });

    const currentPlano = month.planoId
      ? planos.find((plano) => plano.id === month.planoId)
      : undefined;

    // Normalize active to boolean for comparison
    const isCurrentPendingPlano = currentPlano && Boolean(currentPlano.active === true || currentPlano.active === 'true' || currentPlano.active === '1');

    const allActivePlanos = planoMonths
      .filter((pm) => pm.planoId)
      .map((pm) => planos.find((plano) => plano.id === pm.planoId))
      .filter((plano): plano is PlanoMensal => !!plano && Boolean(plano.active === true || plano.active === 'true' || plano.active === '1'));

    let nextDuePlano;
    if (allActivePlanos.length > 0) {
      nextDuePlano = allActivePlanos.reduce((acc, curr) =>
        new Date(curr.dueDate) < new Date(acc.dueDate) ? curr : acc
      );
    }

    if (
      isCurrentPendingPlano &&
      nextDuePlano &&
      currentPlano &&
      currentPlano.id === nextDuePlano.id &&
      newIsPaid
    ) {
      console.log('handlePaymentToggle - Usando handleMarkAsPaid para plano ativo mais próximo');
      handleMarkAsPaid(currentPlano.id, planos, savePlanos);
      
      // Disparar eventos de sincronização
      setTimeout(() => {
        const events = [
          'tarot-payment-updated',
          'planosUpdated',
          'paymentStatusChanged',
          'monthlyPaymentsUpdated'
        ];
        
        events.forEach(eventName => {
          window.dispatchEvent(new CustomEvent(eventName, {
            detail: { 
              updated: true, 
              action: 'mark_as_paid', 
              monthIndex, 
              planoId: currentPlano.id,
              timestamp: Date.now() 
            }
          }));
        });
      }, 50);
      
      return;
    }

    if (month.planoId) {
      const updatedPlanos = planos.map(plano =>
        plano.id === month.planoId
          ? { ...plano, active: Boolean(!newIsPaid) }
          : plano
      );

      savePlanos(updatedPlanos);

      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = newIsPaid;
      setPlanoMonths(updatedMonths);

      console.log(`handlePaymentToggle - Mês ${month.month} marcado como ${newIsPaid ? 'pago' : 'pendente'}`);
    } else if (newIsPaid) {
      // Criar novo plano usando exatamente a data calculada no controle
      const newPlano = createNewPlano(
        analysisId,
        clientName,
        month.month,
        planoData,
        month.dueDate // Usar a data já calculada no controle
      );

      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);

      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      updatedMonths[monthIndex].isPaid = true;
      // A data já está correta no month.dueDate
      setPlanoMonths(updatedMonths);

      console.log('handlePaymentToggle - Novo plano criado com data correta:', {
        planoId: newPlano.id,
        dueDate: newPlano.dueDate,
        month: newPlano.month
      });
    }

    // Disparar eventos de sincronização imediatamente e múltiplas vezes
    const triggerEvents = () => {
      const events = [
        'tarot-payment-updated',
        'planosUpdated',
        'paymentStatusChanged',
        'monthlyPaymentsUpdated'
      ];
      
      events.forEach(eventName => {
        window.dispatchEvent(new CustomEvent(eventName, {
          detail: { 
            updated: true, 
            action: 'toggle', 
            monthIndex, 
            newIsPaid,
            timestamp: Date.now(),
            analysisId 
          }
        }));
      });
    };

    // Disparar eventos múltiplas vezes para garantir sincronização
    triggerEvents();
    setTimeout(triggerEvents, 10);
    setTimeout(triggerEvents, 50);
    setTimeout(triggerEvents, 100);
    setTimeout(triggerEvents, 200);

    toast.success(
      newIsPaid
        ? `Mês ${month.month} marcado como pago`
        : `Mês ${month.month} marcado como pendente`
    );
  };

  return {
    planoMonths,
    handlePaymentToggle,
  };
};
