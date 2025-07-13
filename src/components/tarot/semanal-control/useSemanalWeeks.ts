
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
      
      const correctDueDate = weekDay.toISOString().split('T')[0];
      
      weeks.push({
        week: index + 1,
        isPaid: semanalForWeek ? !semanalForWeek.active : false,
        dueDate: correctDueDate,
        paymentDate: semanalForWeek?.created ? new Date(semanalForWeek.created).toISOString().split('T')[0] : undefined,
        semanalId: semanalForWeek?.id
      });
    });
    
    // Corrigir datas dos planos existentes se necessário
    const correctedPlanos = planos.map(plano => {
      if (plano.type === 'semanal' && 'analysisId' in plano && plano.analysisId === analysisId) {
        const matchingWeek = weeks.find(w => w.semanalId === plano.id);
        if (matchingWeek && plano.dueDate !== matchingWeek.dueDate) {
          console.log(`Corrigindo data do plano semanal ${plano.id} de ${plano.dueDate} para ${matchingWeek.dueDate}`);
          return { ...plano, dueDate: matchingWeek.dueDate };
        }
      }
      return plano;
    });
    
    if (correctedPlanos.some((p, i) => p !== planos[i])) {
      savePlanos(correctedPlanos);
    }
    
    console.log('useSemanalWeeks - Semanas inicializadas:', {
      totalWeeks: weeks.length,
      paidWeeks: weeks.filter(w => w.isPaid).length,
      datesGenerated: weeks.map(w => ({ week: w.week, dueDate: w.dueDate }))
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
              id: `${analysisId}-week-${nextWeek.week}-${Date.now()}`,
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
      
      // Refresh the weeks display
      setTimeout(() => {
        initializeSemanalWeeks();
      }, 100);
    } else if (newIsPaid) {
      const newSemanal: PlanoSemanal = {
        id: `${analysisId}-week-${week.week}-${Date.now()}`,
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
            id: `${analysisId}-week-${nextWeek.week}-${Date.now()}`,
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
      
      // Refresh the weeks display
      setTimeout(() => {
        initializeSemanalWeeks();
      }, 100);
    } else {
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].isPaid = false;
      setSemanalWeeks(updatedWeeks);
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
            action: 'semanal_toggle', 
            weekIndex, 
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
        ? `Semana ${week.week} marcada como paga` 
        : `Semana ${week.week} marcada como pendente`
    );
  };

  return {
    semanalWeeks,
    handlePaymentToggle,
  };
};
