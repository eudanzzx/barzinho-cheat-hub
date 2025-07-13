
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
    
    console.log('DEBUG DATAS - Inicializando:', {
      analysisId,
      totalWeeks,
      diaVencimento,
      startDate: startDate,
      startDateType: typeof startDate
    });
    
    const weekDays = getNextWeekDays(totalWeeks, diaVencimento, new Date(startDate));
    
    console.log('DEBUG DATAS - Datas calculadas pelo weekDayCalculator:', 
      weekDays.map((date, index) => ({
        week: index + 1,
        date: date.toISOString().split('T')[0],
        dateObject: date.toDateString()
      }))
    );
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
    
    // Corrigir TODAS as datas dos planos semanais para garantir consistência com weekDayCalculator
    const correctedPlanos = planos.map(plano => {
      if (plano.type === 'semanal' && 'analysisId' in plano && plano.analysisId === analysisId) {
        const semanalPlano = plano as PlanoSemanal;
        // Encontrar a semana correspondente baseada no número da semana
        const weekNumber = semanalPlano.week || 
          parseInt(semanalPlano.id.match(/-week-(\d+)/)?.[1] || '0');
        
        if (weekNumber > 0 && weekNumber <= weeks.length) {
          const correctWeek = weeks[weekNumber - 1];
          if (correctWeek) {
            // SEMPRE corrigir a data para garantir consistência
            const needsCorrection = semanalPlano.dueDate !== correctWeek.dueDate;
            if (needsCorrection) {
              console.log(`FORÇANDO correção de data do plano semanal ${semanalPlano.id} de ${semanalPlano.dueDate} para ${correctWeek.dueDate}`);
            }
            return { ...semanalPlano, dueDate: correctWeek.dueDate };
          }
        }
      }
      return plano;
    });
    
    // SEMPRE salvar as correções para garantir sincronização
    const hasChanges = correctedPlanos.some((p, i) => p !== planos[i]);
    if (hasChanges) {
      console.log('useSemanalWeeks - Salvando planos com datas corrigidas para sincronização');
      savePlanos(correctedPlanos);
    }
    
    // SEMPRE disparar eventos para atualizar próximos vencimentos
    const triggerSyncEvents = () => {
      window.dispatchEvent(new CustomEvent('tarot-payment-updated', {
        detail: { action: 'date_sync', analysisId, hasChanges }
      }));
      window.dispatchEvent(new CustomEvent('planosUpdated', {
        detail: { action: 'semanal_date_sync', analysisId }
      }));
    };
    
    // Disparar imediatamente e com delay
    triggerSyncEvents();
    setTimeout(triggerSyncEvents, 50);
    setTimeout(triggerSyncEvents, 200);
    
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
    
    console.log('handlePaymentToggle semanal - Iniciando:', {
      weekIndex,
      week: week.week,
      currentIsPaid: week.isPaid,
      newIsPaid,
      dueDate: week.dueDate,
      semanalId: week.semanalId
    });
    
    if (week.semanalId) {
      // Marcar como pago ou pendente
      const updatedPlanos = planos.map(plano => 
        plano.id === week.semanalId 
          ? { ...plano, active: !newIsPaid }
          : plano
      );
      
      // Se marcando como pago, verificar se próxima semana precisa ser criada
      if (newIsPaid) {
        const totalWeeks = parseInt(semanalData.semanas);
        const nextWeekIndex = weekIndex + 1;
        
        if (nextWeekIndex < totalWeeks && nextWeekIndex < semanalWeeks.length) {
          const nextWeek = semanalWeeks[nextWeekIndex];
          
          // Verificar se já existe um plano para esta próxima semana
          const existingNextWeekPlan = updatedPlanos.find(p => 
            p.type === 'semanal' && 
            'analysisId' in p && 
            p.analysisId === analysisId && 
            'week' in p && 
            p.week === nextWeek.week
          );
          
          if (nextWeek && !nextWeek.semanalId && !existingNextWeekPlan) {
            const nextSemanal: PlanoSemanal = {
              id: `${analysisId}-week-${nextWeek.week}-${Date.now() + 1}`,
              clientName: clientName,
              type: 'semanal',
              amount: parseFloat(semanalData.valorSemanal),
              dueDate: nextWeek.dueDate,
              week: nextWeek.week,
              totalWeeks: totalWeeks,
              created: new Date().toISOString(),
              active: true, // Ativo para aparecer nos próximos vencimentos
              notificationTiming: 'on_due_date',
              analysisId: analysisId
            };
            
            console.log('handlePaymentToggle - Criando próxima semana (sem duplicata):', nextSemanal);
            updatedPlanos.push(nextSemanal);
          } else if (existingNextWeekPlan) {
            console.log('handlePaymentToggle - Próxima semana já existe, não criando duplicata:', existingNextWeekPlan.id);
          }
        }
      }
      
      savePlanos(updatedPlanos);
      
      // Refresh das semanas após salvar
      setTimeout(() => {
        initializeSemanalWeeks();
      }, 100);
    } else if (newIsPaid) {
      // Criar novo plano usando exatamente a data calculada no controle
      const newSemanal: PlanoSemanal = {
        id: `${analysisId}-week-${week.week}-${Date.now()}`,
        clientName: clientName,
        type: 'semanal',
        amount: parseFloat(semanalData.valorSemanal),
        dueDate: week.dueDate, // Usar a data já calculada
        week: week.week,
        totalWeeks: parseInt(semanalData.semanas),
        created: new Date().toISOString(),
        active: false, // Marcado como pago (inativo)
        notificationTiming: 'on_due_date',
        analysisId: analysisId
      };
      
      console.log('handlePaymentToggle - Criando novo plano semanal:', newSemanal);
      
      let updatedPlanos = [...planos, newSemanal];
      
      // Verificar se próxima semana precisa ser criada automaticamente
      const totalWeeks = parseInt(semanalData.semanas);
      const nextWeekIndex = weekIndex + 1;
      
      if (nextWeekIndex < totalWeeks && nextWeekIndex < semanalWeeks.length) {
        const nextWeek = semanalWeeks[nextWeekIndex];
        
        // Verificar se já existe um plano para esta próxima semana
        const existingNextWeekPlan = updatedPlanos.find(p => 
          p.type === 'semanal' && 
          'analysisId' in p && 
          p.analysisId === analysisId && 
          'week' in p && 
          p.week === nextWeek.week
        );
        
        if (nextWeek && !nextWeek.semanalId && !existingNextWeekPlan) {
          const nextSemanal: PlanoSemanal = {
            id: `${analysisId}-week-${nextWeek.week}-${Date.now() + 1}`,
            clientName: clientName,
            type: 'semanal',
            amount: parseFloat(semanalData.valorSemanal),
            dueDate: nextWeek.dueDate,
            week: nextWeek.week,
            totalWeeks: totalWeeks,
            created: new Date().toISOString(),
            active: true, // Ativo para aparecer nos próximos vencimentos
            notificationTiming: 'on_due_date',
            analysisId: analysisId
          };
          
          console.log('handlePaymentToggle - Criando próxima semana automaticamente (sem duplicata):', nextSemanal);
          updatedPlanos.push(nextSemanal);
        } else if (existingNextWeekPlan) {
          console.log('handlePaymentToggle - Próxima semana já existe, não criando duplicata:', existingNextWeekPlan.id);
        }
      }
      
      savePlanos(updatedPlanos);
      
      // Refresh das semanas após salvar
      setTimeout(() => {
        initializeSemanalWeeks();
      }, 100);
    } else {
      // Apenas marcar como não pago
      const updatedWeeks = [...semanalWeeks];
      updatedWeeks[weekIndex].isPaid = false;
      setSemanalWeeks(updatedWeeks);
    }
    
    // Disparar eventos de sincronização
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

    // Disparar eventos múltiplas vezes
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
