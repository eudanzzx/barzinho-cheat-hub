
export const getMonthlyDueDates = (totalMonths: number, dueDay: number, startDate?: Date): Date[] => {
  const dueDates: Date[] = [];
  const today = startDate || new Date();
  
  console.log('MonthDayCalculator - Calculando para dia:', dueDay);
  console.log('MonthDayCalculator - Data inicial:', today.toDateString());
  
  for (let i = 1; i <= totalMonths; i++) {
    const dueDate = new Date(today);
    dueDate.setMonth(today.getMonth() + i);
    
    // Set the day of month, handling edge cases
    const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
    const actualDueDay = Math.min(dueDay, lastDayOfMonth);
    
    dueDate.setDate(actualDueDay);
    
    console.log(`MonthDayCalculator - Mês ${i}:`, dueDate.toDateString(), 'Dia:', actualDueDay);
    
    dueDates.push(dueDate);
  }
  
  return dueDates;
};
