
import { useState, useEffect } from "react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";
import { handleMarkAsPaid } from "@/components/tarot/payment-notifications/utils/paymentActions";

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
    
    // Garantir que o dia de vencimento seja válido
    let dueDay = 5; // valor padrão
    if (planoData.diaVencimento) {
      const parsedDay = parseInt(planoData.diaVencimento);
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        dueDay = parsedDay;
      }
    }
    
    console.log('initializePlanoMonths - Dia de vencimento configurado:', dueDay);
    
    const months: PlanoMonth[] = [];
    
    for (let i = 1; i <= totalMonths; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i - 1);
      
      // Ajustar para o último dia do mês se necessário
      const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
      const actualDueDay = Math.min(dueDay, lastDayOfMonth);
      dueDate.setDate(actualDueDay);
      
      console.log(`initializePlanoMonths - Mês ${i}: ${dueDate.toISOString().split('T')[0]} (dia ${actualDueDay})`);
      
      const planoForMonth = planos.find((plano) => 
        plano.analysisId === analysisId &&
        plano.clientName === clientName && 
        plano.type === 'plano' &&
        'month' in plano &&
        plano.month === i && 
        'totalMonths' in plano &&
        plano.totalMonths === totalMonths
      );
      
      months.push({
        month: i,
        isPaid: planoForMonth ? !planoForMonth.active : false,
        dueDate: dueDate.toISOString().split('T')[0],
        paymentDate: planoForMonth?.created ? new Date(planoForMonth.created).toISOString().split('T')[0] : undefined,
        planoId: planoForMonth?.id
      });
    }
    
    setPlanoMonths(months);
  };

  const handlePaymentToggle = (monthIndex: number) => {
    const month = planoMonths[monthIndex];
    const planos = getPlanos();
    const newIsPaid = !month.isPaid;

    // Identificar se existe o plano pendente (ativo)
    const currentPlano = month.planoId
      ? planos.find((plano) => plano.id === month.planoId)
      : undefined;

    // Só chamar a lógica de marcar como pago se:
    // - O mês atual está pendente (ativo)
    // - E é o plano mais próximo vencendo (o "pendente" mais próximo)
    const isCurrentPendingPlano = currentPlano && currentPlano.active;

    // Encontrar o plano ativo (pendente) mais próximo do vencimento
    const allActivePlanos = planoMonths
      .filter((pm) => pm.planoId)
      .map((pm) => planos.find((plano) => plano.id === pm.planoId))
      .filter((plano): plano is PlanoMensal => !!plano && plano.active);

    // O próximo a vencer (e único que pode ser pago pelo fluxo "oficial")
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
      // Marca como pago usando a mesma lógica dos botões das notificações
      handleMarkAsPaid(currentPlano.id, planos, savePlanos);
      return;
    }

    // Continua funcionando a lógica local para os demais meses (histórico/manual)
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
      // Criar novo plano se não existir
      const newPlano: PlanoMensal = {
        id: `${analysisId}-month-${month.month}-${Date.now()}`,
        clientName: clientName,
        type: 'plano',
        amount: parseFloat(planoData.valorMensal),
        dueDate: month.dueDate,
        month: month.month,
        totalMonths: parseInt(planoData.meses),
        created: new Date().toISOString(),
        active: false, // Marcado como pago (inativo)
        notificationTiming: 'on_due_date',
        analysisId: analysisId
      };

      const updatedPlanos = [...planos, newPlano];
      savePlanos(updatedPlanos);

      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      updatedMonths[monthIndex].isPaid = true;
      setPlanoMonths(updatedMonths);

      console.log('handlePaymentToggle - Novo plano criado e marcado como pago:', newPlano.id);
    }

    // Força refresh das notificações com delay para garantir sincronização
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
