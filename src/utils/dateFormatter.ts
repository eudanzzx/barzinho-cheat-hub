/**
 * Utilitário para formatação de datas sem problemas de timezone
 * Processa datas como strings no formato YYYY-MM-DD diretamente
 */

export const formatDateString = (dateString: string, format: 'pt-BR' | 'iso' = 'pt-BR'): string => {
  if (!dateString) return 'Data não informada';
  
  try {
    // Se não está no formato YYYY-MM-DD, retornar como está
    if (!dateString.includes('-') || dateString.split('-').length !== 3) {
      return dateString;
    }
    
    const [year, month, day] = dateString.split('-');
    
    // Validar se os componentes são válidos
    if (!year || !month || !day) {
      return dateString;
    }
    
    if (format === 'pt-BR') {
      return `${day}/${month}/${year}`;
    }
    
    return dateString; // Retorna no formato ISO original
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

export const createLocalDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    // Criar data local sem conversões de timezone
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error('Erro ao criar data local:', error);
    return new Date();
  }
};

export const calculateDaysRemaining = (startDate: string, daysToAdd: number): number => {
  if (!startDate) return 999;
  
  try {
    const [year, month, day] = startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const target = new Date(year, month - 1, day + daysToAdd);
    const today = new Date();
    
    const diffTime = target.getTime() - today.getTime();
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  } catch (error) {
    console.error('Erro ao calcular dias restantes:', error);
    return 999;
  }
};