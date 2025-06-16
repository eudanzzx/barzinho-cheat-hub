
import { useMemo } from 'react';

interface AtendimentoData {
  id: string;
  nome: string;
  statusPagamento: 'pago' | 'pendente' | 'parcelado';
  dataAtendimento: string;
  valor: string;
}

export const useIndexStats = (atendimentos: AtendimentoData[]) => {
  return useMemo(() => {
    const totalAtendimentos = atendimentos.length;
    const now = new Date();

    // Corrigir início e fim da semana (segunda a domingo)
    const dayOfWeek = now.getDay();
    // Ajusta início da semana para segunda-feira (0 = domingo, 1 = segunda, ...)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Início/fim do mês
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Início/fim do ano
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31);

    // Função auxiliar para pagar apenas pagamentos "pago" dentro de um período
    const somaPorPeriodo = (inicio: Date, fim: Date) => (
      atendimentos
        .filter(a => {
          if (a.statusPagamento !== 'pago') return false;
          const date = new Date(a.dataAtendimento);
          // Inclui datas dentro do intervalo (inclusive)
          return date >= inicio && date <= fim;
        })
        .reduce((sum, a) => sum + parseFloat(a.valor || '0'), 0)
    );

    const totalRecebido = atendimentos
      .filter(a => a.statusPagamento === 'pago')
      .reduce((sum, a) => sum + parseFloat(a.valor || '0'), 0);

    const totalRecebidoSemana = somaPorPeriodo(weekStart, weekEnd);
    const totalRecebidoMes = somaPorPeriodo(monthStart, monthEnd);
    const totalRecebidoAno = somaPorPeriodo(yearStart, yearEnd);

    const atendimentosSemana = atendimentos.filter(a => {
      const date = new Date(a.dataAtendimento);
      return date >= weekStart && date <= weekEnd;
    }).length;

    return {
      totalAtendimentos,
      atendimentosSemana,
      totalRecebido,
      totalRecebidoSemana,
      totalRecebidoMes,
      totalRecebidoAno
    };
  }, [atendimentos]);
};
