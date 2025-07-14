import { useMemo } from 'react';
import { useOptimizedDebounce } from './useOptimizedDebounce';

interface AtendimentoData {
  id: string;
  nome: string;
  dataAtendimento: string;
  statusPagamento: string;
  [key: string]: any;
}

// Cache para filtros
const filterCache = new Map<string, AtendimentoData[]>();

export const useOptimizedIndexFiltering = (
  atendimentos: AtendimentoData[], 
  periodoVisualizacao: 'semana' | 'mes' | 'ano' | 'total',
  searchTerm: string
) => {
  const debouncedSearchTerm = useOptimizedDebounce(searchTerm, 200);

  return useMemo(() => {
    const cacheKey = `${atendimentos.length}-${periodoVisualizacao}-${debouncedSearchTerm}`;
    
    if (filterCache.has(cacheKey)) {
      return filterCache.get(cacheKey)!;
    }

    let filtered = atendimentos;

    // Filtro por período
    if (periodoVisualizacao !== 'total') {
      const now = new Date();
      let startDate: Date;
      
      switch (periodoVisualizacao) {
        case 'semana':
          const dayOfWeek = now.getDay();
          const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
          break;
        case 'mes':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'ano':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(atendimento => {
        const dataAtendimento = new Date(atendimento.dataAtendimento);
        return dataAtendimento >= startDate;
      });
    }

    // Filtro por busca
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(atendimento =>
        atendimento.nome?.toLowerCase().includes(searchLower)
      );
    }

    // Cache do resultado
    filterCache.set(cacheKey, filtered);
    
    // Limitar tamanho do cache
    if (filterCache.size > 10) {
      const firstKey = filterCache.keys().next().value;
      filterCache.delete(firstKey);
    }

    return filtered;
  }, [atendimentos, periodoVisualizacao, debouncedSearchTerm]);
};