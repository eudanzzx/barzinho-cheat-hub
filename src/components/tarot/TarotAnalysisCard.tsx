
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import AnalysisHeader from "./TarotAnalysisCard/AnalysisHeader";
import AnalysisActions from "./TarotAnalysisCard/AnalysisActions";

const TarotAnalysisCard = React.memo(({
    analise,
    formattedTime,
    timeRemaining,
    onToggleFinished,
    onEdit,
    onDelete
  }: {
    analise: any;
    formattedTime: string | null;
    timeRemaining: any;
    onToggleFinished: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => {

  return (
    <Card
      className="bg-white/80 border border-[#ede9fe] hover:bg-white/90 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] animate-fade-in group"
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-3">
          <AnalysisHeader 
            analise={analise}
            formattedTime={formattedTime}
            timeRemaining={timeRemaining}
          />
          <AnalysisActions
            analise={analise}
            onToggleFinished={onToggleFinished}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
});

TarotAnalysisCard.displayName = 'TarotAnalysisCard';

export default TarotAnalysisCard;
