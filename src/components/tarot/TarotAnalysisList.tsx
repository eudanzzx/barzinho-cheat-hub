
import React from "react";
import TarotAnalysisCard from "./TarotAnalysisCard";

const TarotAnalysisList = React.memo(
  ({
    analises,
    calculateTimeRemaining,
    formatTimeRemaining,
    onToggleFinished,
    onEdit,
    onDelete,
  }: {
    analises: any[];
    calculateTimeRemaining: (analise: any) => any;
    formatTimeRemaining: (remaining: any) => string | null;
    onToggleFinished: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => {
    
    // Renderizar apenas os primeiros 20 itens para melhor performance
    const visibleAnalises = analises.slice(0, 20);
    
    return (
      <div className="space-y-3">
        {visibleAnalises.map((analise) => {
          const timeRemaining = calculateTimeRemaining(analise);
          const formattedTime = formatTimeRemaining(timeRemaining);
          return (
            <TarotAnalysisCard
              key={analise.id}
              analise={analise}
              formattedTime={formattedTime}
              timeRemaining={timeRemaining}
              onToggleFinished={onToggleFinished}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
        {analises.length > 20 && (
          <div className="text-center text-slate-500 text-sm py-2">
            Mostrando {visibleAnalises.length} de {analises.length} análises
          </div>
        )}
      </div>
    );
  }
);

TarotAnalysisList.displayName = 'TarotAnalysisList';

export default TarotAnalysisList;
