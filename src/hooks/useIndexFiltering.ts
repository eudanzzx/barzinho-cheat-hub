
import { useState, useEffect, useCallback } from 'react';

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

  const filterAtendimentos = useCallback((
    atendimentos: AtendimentoData[], 
    periodo: 'semana' | 'mes' | 'ano' | 'total', 
    searchTerm: string
  ) => {
    const now = new Date();
    let dataInicio: Date;

    switch (periodo) {
      case 'semana':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        dataInicio = new Date(now.setDate(diff));
        break;
      case 'mes':
        dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'ano':
        dataInicio = new Date(now.getFullYear(), 0, 1);
        break;
      case 'total':
        dataInicio = new Date(0);
        break;
      default:
        dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const atendimentosFiltrados = atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      const correspondePeriodo = periodo === 'total' || dataAtendimento >= dataInicio;

      const termoPesquisa = searchTerm.toLowerCase().trim();
      const correspondeTermo = atendimento.nome.toLowerCase().includes(termoPesquisa);

      return correspondePeriodo && correspondeTermo;
    });

    setFilteredAtendimentos(atendimentosFiltrados);
  }, []);

  useEffect(() => {
    filterAtendimentos(atendimentos, periodoVisualizacao, searchTerm);
  }, [atendimentos, periodoVisualizacao, searchTerm, filterAtendimentos]);

  return filteredAtendimentos;
};
