
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface AtendimentoData {
  id: string;
  nome: string;
  dataAtendimento: string;
  [key: string]: any;
}

export const useIndexFiltering = (
  atendimentos: AtendimentoData[],
  periodoVisualizacao: 'semana' | 'mes' | 'ano' | 'total',
  searchTerm: string
) => {
  const [filteredAtendimentos, setFilteredAtendimentos] = useState<AtendimentoData[]>([]);
  
  // Debounce search term para evitar filtros desnecessários
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoizar cálculo da data de início para evitar recálculos
  const dataInicio = useMemo(() => {
    const now = new Date();
    
    switch (periodoVisualizacao) {
      case 'semana':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(now.setDate(diff));
      case 'mes':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'ano':
        return new Date(now.getFullYear(), 0, 1);
      case 'total':
        return new Date(0);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }, [periodoVisualizacao]);

  const filterAtendimentos = useCallback((
    atendimentos: AtendimentoData[], 
    periodo: 'semana' | 'mes' | 'ano' | 'total', 
    searchTerm: string,
    dataInicio: Date
  ) => {
    const atendimentosFiltrados = atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      const correspondePeriodo = periodo === 'total' || dataAtendimento >= dataInicio;

      const termoPesquisa = searchTerm.toLowerCase().trim();
      const correspondeTermo = !termoPesquisa || atendimento.nome.toLowerCase().includes(termoPesquisa);

      return correspondePeriodo && correspondeTermo;
    });

    setFilteredAtendimentos(atendimentosFiltrados);
  }, []);

  useEffect(() => {
    filterAtendimentos(atendimentos, periodoVisualizacao, debouncedSearchTerm, dataInicio);
  }, [atendimentos, periodoVisualizacao, debouncedSearchTerm, dataInicio, filterAtendimentos]);

  return filteredAtendimentos;
};
