
export const getNextWeekDays = (totalWeeks: number, targetWeekDay: string, startDate?: Date): Date[] => {
  const weekDays: Date[] = [];
  const today = startDate || new Date();
  
  console.log('🔍 WeekDayCalculator - ENTRADA COMPLETA:', {
    totalWeeks,
    targetWeekDay,
    targetWeekDayType: typeof targetWeekDay,
    startDate: startDate ? startDate.toDateString() : 'undefined',
    today: today.toDateString(),
    usingStartDate: !!startDate,
    isValidTargetWeekDay: typeof targetWeekDay === 'string' && targetWeekDay.length > 0
  });
  
  // Mapear strings para números (0 = domingo, 1 = segunda, etc.) - padrão brasileiro
  const weekDayMap: { [key: string]: number } = {
    'domingo': 0,
    'segunda': 1,
    'terca': 2,
    'quarta': 3,
    'quinta': 4,
    'sexta': 5,
    'sabado': 6
  };
  
  const targetDay = weekDayMap[targetWeekDay];
  
  if (targetDay === undefined) {
    console.error('WeekDayCalculator - Dia da semana inválido:', targetWeekDay);
    return [];
  }
  
  console.log('WeekDayCalculator - Calculando para dia:', targetWeekDay, 'Número:', targetDay);
  console.log('WeekDayCalculator - Data inicial:', today.toDateString(), 'Dia da semana:', today.getDay());
  
  // Encontrar o próximo dia da semana especificado a partir da data de início
  let nextTargetDay = new Date(today);
  const currentDay = today.getDay();
  
  // Calcular quantos dias adicionar para chegar no próximo dia especificado
  let daysToAdd;
  
  if (currentDay === targetDay) {
    // Se hoje é o dia especificado, usar o mesmo dia (primeira ocorrência)
    daysToAdd = 0;
  } else if (currentDay < targetDay) {
    // Se é antes do dia especificado na semana atual
    daysToAdd = targetDay - currentDay;
  } else {
    // Se é depois do dia especificado (vai para a próxima semana)
    daysToAdd = 7 - currentDay + targetDay;
  }
  
  console.log('WeekDayCalculator - Dias para adicionar para primeira ocorrência:', daysToAdd);
  
  nextTargetDay.setDate(today.getDate() + daysToAdd);
  console.log('WeekDayCalculator - Primeiro vencimento:', nextTargetDay.toDateString(), 'Dia da semana:', nextTargetDay.getDay());
  
  // Gerar os vencimentos semanais
  for (let i = 0; i < totalWeeks; i++) {
    const targetDate = new Date(nextTargetDay);
    targetDate.setDate(nextTargetDay.getDate() + (i * 7));
    
    console.log(`WeekDayCalculator - Semana ${i + 1}:`, targetDate.toDateString(), 'Dia da semana:', targetDate.getDay());
    
    weekDays.push(targetDate);
  }
  
  return weekDays;
};

// Manter compatibilidade com o código existente que usa sexta-feira
export const getNextFridays = (totalWeeks: number, startDate?: Date): Date[] => {
  return getNextWeekDays(totalWeeks, 'sexta', startDate);
};
