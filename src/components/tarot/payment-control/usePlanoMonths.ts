
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
    
    setPlanoMonths(months);
  };

  const handlePaymentToggle = (monthIndex: number) => {
    const month = planoMonths[monthIndex];
    const planos = getPlanos();
    const newIsPaid = !month.isPaid;

    const currentPlano = month.planoId
      ? planos.find((plano) => plano.id === month.planoId)
      : undefined;

    const isCurrentPendingPlano = currentPlano && currentPlano.active;

    const allActivePlanos = planoMonths
      .filter((pm) => pm.planoId)
      .map((pm) => planos.find((plano) => plano.id === pm.planoId))
      .filter((plano): plano is PlanoMensal => !!plano && plano.active);

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
      handleMarkAsPaid(currentPlano.id, planos, savePlanos);
      return;
    }

    if (month.planoId) {
      const updatedPlanos = planos.map(plano =>
        plano.id === month.planoId
          ? { ...plano, active: !newIsPaid }
          : plano
      );

      savePlanos(updatedPlanos);

      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = newIsPaid;
      setPlanoMonths(updatedMonths);

      console.log(`handlePaymentToggle - Mês ${month.month} marcado como ${newIsPaid ? 'pago' : 'pendente'}`);
    } else if (newIsPaid) {
      const dueDay = planoData.diaVencimento ? parseInt(planoData.diaVencimento) : 5;
      const actualDueDate = new Date(month.dueDate);
      const lastDayOfMonth = new Date(actualDueDate.getFullYear(), actualDueDate.getMonth() + 1, 0).getDate();
      const correctedDueDay = Math.min(dueDay, lastDayOfMonth);
      actualDueDate.setDate(correctedDueDay);
      
      const newPlano = createNewPlano(
        analysisId,
        clientName,
        month.month,
        planoData,
        actualDueDate.toISOString().split('T')[0]
      );

      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);

      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      updatedMonths[monthIndex].isPaid = true;
      updatedMonths[monthIndex].dueDate = actualDueDate.toISOString().split('T')[0];
      setPlanoMonths(updatedMonths);

      console.log('handlePaymentToggle - Novo plano criado e marcado como pago:', newPlano.id);
    }

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('tarot-payment-updated', {
        detail: { updated: true, action: 'toggle', monthIndex, timestamp: Date.now() }
      }));
      window.dispatchEvent(new CustomEvent('planosUpdated', {
        detail: { updated: true, action: 'toggle', monthIndex, timestamp: Date.now() }
      }));
    }, 100);

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
