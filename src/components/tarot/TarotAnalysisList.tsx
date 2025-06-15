import React from "react";
import TarotAnalysisCard from "./TarotAnalysisCard";

// Otimização extra: usa React.memo e só re-renderiza se análises mudarem
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
    return (
      <div className="grid gap-4">
        {analises.map((analise, index) => {
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
      </div>
    );
  }
);

export default TarotAnalysisList;
