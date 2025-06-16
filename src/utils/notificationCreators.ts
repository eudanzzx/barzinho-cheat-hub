
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import { getNextWeekDays } from "@/utils/weekDayCalculator";

export const createPlanoNotifications = (
  nomeCliente: string, 
  meses: string, 
  valorMensal: string, 
  dataInicio: string, 
  diaVencimento?: string
): PlanoMensal[] => {
  const notifications: PlanoMensal[] = [];
  const startDate = new Date(dataInicio);
  
  // Usar o dia de vencimento selecionado ou padrão (5)
  const dueDay = diaVencimento ? parseInt(diaVencimento) : 5;
  
  for (let i = 1; i <= parseInt(meses); i++) {
    const notificationDate = new Date(startDate);
    notificationDate.setMonth(notificationDate.getMonth() + i);
    
    // Ajustar para o dia de vencimento correto
    const lastDayOfMonth = new Date(notificationDate.getFullYear(), notificationDate.getMonth() + 1, 0).getDate();
    const actualDueDay = Math.min(dueDay, lastDayOfMonth);
    notificationDate.setDate(actualDueDay);
    
    notifications.push({
      id: `plano-${Date.now()}-${i}`,
      clientName: nomeCliente,
      type: 'plano',
      amount: parseFloat(valorMensal),
      dueDate: notificationDate.toISOString().split('T')[0],
      month: i,
      totalMonths: parseInt(meses),
      created: new Date().toISOString(),
      active: true,
      notificationTiming: 'on_due_date'
    });
  }
  
  return notifications;
};

export const createSemanalNotifications = (
  nomeCliente: string, 
  semanas: string, 
  valorSemanal: string, 
  dataInicio: string, 
  diaVencimento: string
): PlanoSemanal[] => {
  const notifications: PlanoSemanal[] = [];
  const totalWeeks = parseInt(semanas);
  
  console.log('NotificationCreators - Criando notificações semanais para dia:', diaVencimento);
  
  const weekDays = getNextWeekDays(totalWeeks, diaVencimento, new Date(dataInicio));
  
  console.log('NotificationCreators - Datas calculadas:', weekDays.map(d => d.toDateString()));
  
  weekDays.forEach((weekDay, index) => {
    notifications.push({
      id: `semanal-${Date.now()}-${index + 1}`,
      clientName: nomeCliente,
      type: 'semanal',
      amount: parseFloat(valorSemanal),
      dueDate: weekDay.toISOString().split('T')[0],
      week: index + 1,
      totalWeeks: totalWeeks,
      created: new Date().toISOString(),
      active: true
    });
  });
  
  return notifications;
};
