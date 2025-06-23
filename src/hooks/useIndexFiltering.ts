
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

  const filterAtendimentos = useCallback((
    atendimentos: AtendimentoData[], 
    searchTerm: string
  ) => {
    const atendimentosFiltrados = atendimentos.filter(atendimento => {
      const termoPesquisa = searchTerm.toLowerCase().trim();
      const correspondeTermo = !termoPesquisa || atendimento.nome.toLowerCase().includes(termoPesquisa);

      return correspondeTermo;
    });

    setFilteredAtendimentos(atendimentosFiltrados);
  }, []);

  useEffect(() => {
    // Agora filtra apenas por termo de busca, não por período
    filterAtendimentos(atendimentos, debouncedSearchTerm);
  }, [atendimentos, debouncedSearchTerm, filterAtendimentos]);

  return filteredAtendimentos;
};
