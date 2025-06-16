
import React from 'react';
import DashboardStats from "./DashboardStats";

interface IndexStatsProps {
  calculateStats: any;
  periodoVisualizacao: 'semana' | 'mes' | 'ano' | 'total';
  setPeriodoVisualizacao: (periodo: 'semana' | 'mes' | 'ano' | 'total') => void;
}

const IndexStats: React.FC<IndexStatsProps> = ({
  calculateStats,
  periodoVisualizacao,
  setPeriodoVisualizacao
}) => {
  return (
    <DashboardStats 
      totalAtendimentos={calculateStats.totalAtendimentos}
      atendimentosSemana={calculateStats.atendimentosSemana}
      totalRecebido={calculateStats.totalRecebido}
      totalRecebidoSemana={calculateStats.totalRecebidoSemana}
      totalRecebidoMes={calculateStats.totalRecebidoMes}
      totalRecebidoAno={calculateStats.totalRecebidoAno}
      selectedPeriod={periodoVisualizacao}
      onPeriodChange={setPeriodoVisualizacao}
    />
  );
};

export default IndexStats;
