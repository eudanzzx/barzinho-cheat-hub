
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useThrottledDebounce } from './useThrottledDebounce';

// Hook super otimizado para todas as operações do tarot
export const useTarotOptimized = (data: any[], activeTab: string, searchTerm: string) => {
  const debouncedSearchTerm = useThrottledDebounce(searchTerm, 150);
  
  // Filtros otimizados com single pass
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    return data.filter(item => {
      // Filtro por tab
      if (activeTab === 'finalizadas' && !item.finalizado) return false;
      if (activeTab === 'em-andamento' && item.finalizado) return false;
      if (activeTab === 'pendentes' && item.finalizado) return false;
      
      // Filtro por busca
      if (debouncedSearchTerm.trim()) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const clientName = (item.nomeCliente || item.clientName || '').toLowerCase();
        if (!clientName.includes(searchLower)) return false;
      }
      
      return true;
    });
  }, [data, activeTab, debouncedSearchTerm]);
  
  // Estatísticas calculadas em uma única passagem
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    let total = 0;
    let finalizados = 0;
    let emAndamento = 0;
    let semana = 0;
    let mes = 0;
    let ano = 0;
    
    for (const item of data) {
      const valor = Number(item.valor) || 0;
      const dataAtendimento = new Date(item.dataAtendimento);
      
      // Contadores
      if (item.finalizado) finalizados++;
      else emAndamento++;
      
      // Valores
      total += valor;
      if (dataAtendimento >= startOfWeek) semana += valor;
      if (dataAtendimento >= startOfMonth) mes += valor;
      if (dataAtendimento >= startOfYear) ano += valor;
    }
    
    return {
      total: data.length,
      finalizados,
      emAndamento,
      atencao: 0,
      receita: { total, semana, mes, ano }
    };
  }, [data]);
  
  return {
    filteredData,
    stats,
    isEmpty: filteredData.length === 0
  };
};
