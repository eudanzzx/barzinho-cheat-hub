
import { useState, useEffect } from "react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";
import { getNextWeekDays } from "@/utils/weekDayCalculator";

interface SemanalWeek {
  week: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
  semanalId?: string;
}

interface UseSemanalWeeksProps {
  analysisId: string;
  clientName: string;
  semanalData: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  };
  startDate: string;
}

export const useSemanalWeeks = ({
  analysisId,
  clientName,
  semanalData,
  startDate,
}: UseSemanalWeeksProps) => {
  const { getPlanos, savePlanos } = useUserDataService();
  const [semanalWeeks, setSemanalWeeks] = useState<SemanalWeek[]>([]);

  useEffect(() => {
    initializeSemanalWeeks();
  }, [analysisId, semanalData, startDate]);

  const initializeSemanalWeeks = () => {
    const totalWeeks = parseInt(semanalData.semanas);
    const diaVencimento = semanalData.diaVencimento || 'sexta';
    
    const weekDays = getNextWeekDays(totalWeeks, diaVencimento, new Date(startDate));
    const planos = getPlanos();
    
    const weeks: SemanalWeek[] = [];
    
    weekDays.forEach((weekDay, index) => {
      const semanalForWeek = planos.find((plano): plano is PlanoSemanal => 
        plano.id.startsWith(`${analysisId}-week-${index + 1}`) && plano.type === 'semanal'
      );
      
      weeks.push({
        week: index + 1,
        isPaid: semanalForWeek ? !semanalForWeek.active : false,
        dueDate: weekDay.toISOString().split('T')[0],
        paymentDate: semanalForWeek?.created ? new Date(semanalForWeek.created).toISOString().split('T')[0] : undefined,
        semanalId: semanalForWeek?.id
      });
    });
    
    setSemanalWeeks(weeks);
  };

  const handlePaymentToggle = (weekIndex: number) => {
    const week = semanalWeeks[weekIndex];
    const planos = getPlanos();
    
    const newIsPaid = !week.isPaid;
    
    if (week.semanalId) {
      // Mark as paid or unpaid
      const updatedPlanos = planos.map(plano => 
        plano.id === week.semanalId 
          ? { ...plano, active: !newIsPaid }
          : plano
      );
      
      // If marking as paid, automatically create next week's payment
      if (newIsPaid) {
        const totalWeeks = parseInt(semanalData.semanas);
        const nextWeekIndex = weekIndex + 1;
        
        if (nextWeekIndex < totalWeeks) {
          const nextWeek = semanalWeeks[nextWeekIndex];
          if (nextWeek && !nextWeek.semanalId) {
            const nextSemanal: PlanoSemanal = {
              id: `${analysisId}-week-${nextWeek.week}`,
              clientName: clientName,
              type: 'semanal',
              amount: parseFloat(semanalData.valorSemanal),
              dueDate: nextWeek.dueDate,
              week: nextWeek.week,
              totalWeeks: totalWeeks,
              created: new Date().toISOString(),
              active: true,
              notificationTiming: 'on_due_date',
              analysisId: analysisId
            };
            
            updatedPlanos.push(nextSemanal);
          }
        }
      }
      
      savePlanos(updatedPlanos);
      
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].isPaid = newIsPaid;
      setSemanalWeeks(updatedWeeks);
    } else if (newIsPaid) {
      const newSemanal: PlanoSemanal = {
        id: `${analysisId}-week-${week.week}`,
        clientName: clientName,
        type: 'semanal',
        amount: parseFloat(semanalData.valorSemanal),
        dueDate: week.dueDate,
        week: week.week,
        totalWeeks: parseInt(semanalData.semanas),
        created: new Date().toISOString(),
        active: false,
        notificationTiming: 'on_due_date',
        analysisId: analysisId
      };
      
      let updatedPlanos = [...planos, newSemanal];
      
      // Create next week's payment if not the last week
      const totalWeeks = parseInt(semanalData.semanas);
      const nextWeekIndex = weekIndex + 1;
      
      if (nextWeekIndex < totalWeeks) {
        const nextWeek = semanalWeeks[nextWeekIndex];
        if (nextWeek && !nextWeek.semanalId) {
          const nextSemanal: PlanoSemanal = {
            id: `${analysisId}-week-${nextWeek.week}`,
            clientName: clientName,
            type: 'semanal',
            amount: parseFloat(semanalData.valorSemanal),
            dueDate: nextWeek.dueDate,
            week: nextWeek.week,
            totalWeeks: totalWeeks,
            created: new Date().toISOString(),
            active: true,
            notificationTiming: 'on_due_date',
            analysisId: analysisId
          };
          
          updatedPlanos.push(nextSemanal);
        }
      }
      
      savePlanos(updatedPlanos);
      
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].semanalId = newSemanal.id;
      updatedWeeks[weekIndex].isPaid = true;
      setSemanalWeeks(updatedWeeks);
    } else {
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].isPaid = false;
      setSemanalWeeks(updatedWeeks);
    }
    
    // Force refresh of notification button by dispatching custom event
    window.dispatchEvent(new CustomEvent('tarot-payment-updated'));
    
    toast.success(
      newIsPaid 
        ? `Semana ${week.week} marcada como paga` 
        : `Semana ${week.week} marcada como pendente`
    );
  };

  return {
    semanalWeeks,
    handlePaymentToggle,
  };
};
