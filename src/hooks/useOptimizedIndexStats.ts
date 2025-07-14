import { useMemo } from 'react';

interface AtendimentoData {
  id: string;
  nome: string;
  statusPagamento: 'pago' | 'pendente' | 'parcelado';
  dataAtendimento: string;
  valor: string;
}

// Cache para evitar recálculos desnecessários
const statsCache = new Map<string, any>();

export const useOptimizedIndexStats = (atendimentos: AtendimentoData[]) => {
  return useMemo(() => {
    // Criar chave do cache baseada no hash dos dados
    const cacheKey = `${atendimentos.length}-${atendimentos.reduce((acc, a) => acc + a.id + a.statusPagamento + a.valor, '')}`;
    
    if (statsCache.has(cacheKey)) {
      return statsCache.get(cacheKey);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Pre-calcular datas uma única vez
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today.getTime() + diffToMonday * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31);

    // Processar todos os atendimentos em uma única passada
    let totalRecebido = 0;
    let totalRecebidoSemana = 0;
    let totalRecebidoMes = 0;
    let totalRecebidoAno = 0;
    let atendimentosSemana = 0;

    for (const atendimento of atendimentos) {
      const valor = parseFloat(atendimento.valor || '0');
      const date = new Date(atendimento.dataAtendimento);
      
      // Contar atendimentos da semana
      if (date >= weekStart && date <= weekEnd) {
        atendimentosSemana++;
      }
      
      // Somar valores apenas se pagos
      if (atendimento.statusPagamento === 'pago') {
        totalRecebido += valor;
        
        if (date >= weekStart && date <= weekEnd) {
          totalRecebidoSemana += valor;
        }
        if (date >= monthStart && date <= monthEnd) {
          totalRecebidoMes += valor;
        }
        if (date >= yearStart && date <= yearEnd) {
          totalRecebidoAno += valor;
        }
      }
    }

    const stats = {
      totalAtendimentos: atendimentos.length,
      atendimentosSemana,
      totalRecebido,
      totalRecebidoSemana,
      totalRecebidoMes,
      totalRecebidoAno
    };

    // Cache do resultado
    statsCache.set(cacheKey, stats);
    
    // Limpar cache antigo (manter apenas 5 entradas)
    if (statsCache.size > 5) {
      const firstKey = statsCache.keys().next().value;
      statsCache.delete(firstKey);
    }

    return stats;
  }, [atendimentos]);
};