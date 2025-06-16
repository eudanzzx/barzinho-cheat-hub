
import React, { memo, useMemo } from "react";
import TarotAnalysisCard from "./TarotAnalysisCard";

const TarotAnalysisListOptimized = memo(
  ({
    analises,
    onToggleFinished,
    onEdit,
    onDelete,
  }: {
    analises: any[];
    onToggleFinished: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => {
    
    // Otimizar renderização limitando itens visíveis
    const visibleAnalises = useMemo(() => {
      return analises.slice(0, 50); // Aumentei para 50 mas ainda mantendo performance
    }, [analises]);
    
    // Funções otimizadas para melhor performance
    const calculateTimeRemaining = React.useCallback(() => null, []);
    const formatTimeRemaining = React.useCallback(() => null, []);
    
    return (
      <div className="space-y-3">
        {visibleAnalises.map((analise) => (
          <TarotAnalysisCard
            key={analise.id}
            analise={analise}
            formattedTime={null}
            timeRemaining={null}
            onToggleFinished={onToggleFinished}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {analises.length > 50 && (
          <div className="text-center text-slate-500 text-sm py-2 bg-white/50 rounded-lg">
            Mostrando {visibleAnalises.length} de {analises.length} análises
            <p className="text-xs mt-1">Utilize a busca para encontrar análises específicas</p>
          </div>
        )}
      </div>
    );
  }
);

TarotAnalysisListOptimized.displayName = 'TarotAnalysisListOptimized';

export default TarotAnalysisListOptimized;
