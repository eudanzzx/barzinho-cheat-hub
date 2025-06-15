
import { useState, useEffect } from "react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal } from "@/types/payment";

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
    
    const months: PlanoMonth[] = [];
    
    for (let i = 1; i <= totalMonths; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
      const actualDueDay = Math.min(dueDay, lastDayOfMonth);
      dueDate.setDate(actualDueDay);
      
      const planoForMonth = planos.find((plano) => 
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
    
    if (month.planoId) {
      // Mark as paid or unpaid
      const updatedPlanos = planos.map(plano => 
        plano.id === month.planoId 
          ? { ...plano, active: !newIsPaid }
          : plano
      );
      
      // If marking as paid, automatically create next month's payment
      if (newIsPaid) {
        const totalMonths = parseInt(planoData.meses);
        const nextMonthIndex = monthIndex + 1;
        
        if (nextMonthIndex < totalMonths) {
          const nextMonth = planoMonths[nextMonthIndex];
          if (nextMonth && !nextMonth.planoId) {
            const nextPlano: PlanoMensal = {
              id: `${analysisId}-month-${nextMonth.month}`,
              clientName: clientName,
              type: 'plano',
              amount: parseFloat(planoData.valorMensal),
              dueDate: nextMonth.dueDate,
              month: nextMonth.month,
              totalMonths: totalMonths,
              created: new Date().toISOString(),
              active: true,
              notificationTiming: 'on_due_date',
              analysisId: analysisId
            };
            
            updatedPlanos.push(nextPlano);
          }
        }
      }
      
      savePlanos(updatedPlanos);
      
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = newIsPaid;
      setPlanoMonths(updatedMonths);
    } else if (newIsPaid) {
      const newPlano: PlanoMensal = {
        id: `${analysisId}-month-${month.month}`,
        clientName: clientName,
        type: 'plano',
        amount: parseFloat(planoData.valorMensal),
        dueDate: month.dueDate,
        month: month.month,
        totalMonths: parseInt(planoData.meses),
        created: new Date().toISOString(),
        active: false,
        notificationTiming: 'on_due_date',
        analysisId: analysisId
      };
      
      let updatedPlanos = [...planos, newPlano];
      
      // Create next month's payment if not the last month
      const totalMonths = parseInt(planoData.meses);
      const nextMonthIndex = monthIndex + 1;
      
      if (nextMonthIndex < totalMonths) {
        const nextMonth = planoMonths[nextMonthIndex];
        if (nextMonth && !nextMonth.planoId) {
          const nextPlano: PlanoMensal = {
            id: `${analysisId}-month-${nextMonth.month}`,
            clientName: clientName,
            type: 'plano',
            amount: parseFloat(planoData.valorMensal),
            dueDate: nextMonth.dueDate,
            month: nextMonth.month,
            totalMonths: totalMonths,
            created: new Date().toISOString(),
            active: true,
            notificationTiming: 'on_due_date',
            analysisId: analysisId
          };
          
          updatedPlanos.push(nextPlano);
        }
      }
      
      savePlanos(updatedPlanos);
      
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].planoId = newPlano.id;
      updatedMonths[monthIndex].isPaid = true;
      setPlanoMonths(updatedMonths);
    } else {
      const updatedMonths = [...planoMonths];
      updatedMonths[monthIndex].isPaid = false;
      setPlanoMonths(updatedMonths);
    }
    
    // Force refresh of notification button by dispatching custom event
    window.dispatchEvent(new CustomEvent('tarot-payment-updated'));
    
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
