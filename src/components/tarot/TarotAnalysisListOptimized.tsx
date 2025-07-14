
import React, { memo, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import TarotAnalysisCardOptimized from "./TarotAnalysisCardOptimized";
import VirtualizedListOptimized from "@/components/VirtualizedListOptimized";

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
    const [showAll, setShowAll] = useState(false);
    const ITEMS_PER_PAGE = 6; // Reduzir ainda mais para máxima performance
    
    // Super otimizar renderização limitando itens visíveis
    const visibleAnalises = useMemo(() => {
      if (showAll) {
        return analises.slice(0, 15); // Reduzir máximo para 15
      }
      return analises.slice(0, ITEMS_PER_PAGE);
    }, [analises, showAll]);
    
    // Funções super otimizadas com useCallback
    const handleToggleFinished = useCallback((id: string) => {
      onToggleFinished(id);
    }, [onToggleFinished]);
    
    const handleEdit = useCallback((id: string) => {
      onEdit(id);
    }, [onEdit]);
    
    const handleDelete = useCallback((id: string) => {
      onDelete(id);
    }, [onDelete]);
    
    const toggleShowAll = useCallback(() => {
      setShowAll(prev => !prev);
    }, []);
    
    const hasMoreItems = analises.length > ITEMS_PER_PAGE;
    const hiddenCount = Math.min(analises.length - ITEMS_PER_PAGE, 15); // Limitar contagem
    
    const renderAnaliseItem = useCallback((analise: any) => (
      <TarotAnalysisCardOptimized
        key={analise.id}
        analise={analise}
        formattedTime={null}
        timeRemaining={null}
        onToggleFinished={handleToggleFinished}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ), [handleToggleFinished, handleEdit, handleDelete]);

    return (
      <div className="space-y-3">
        <VirtualizedListOptimized
          items={visibleAnalises}
          renderItem={renderAnaliseItem}
          maxVisibleItems={showAll ? 15 : ITEMS_PER_PAGE}
          itemHeight={120}
          containerHeight="600px"
        />
        
        {hasMoreItems && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="text-center text-slate-500 text-sm bg-white/50 rounded-lg p-3 w-full">
              {showAll ? (
                <p>Mostrando {visibleAnalises.length} análises</p>
              ) : (
                <p>
                  Mostrando {visibleAnalises.length} de {analises.length} análises
                  <br />
                  <span className="text-xs mt-1 block">
                    {hiddenCount} análise{hiddenCount !== 1 ? 's' : ''} oculta{hiddenCount !== 1 ? 's' : ''}
                  </span>
                </p>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={toggleShowAll}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Mostrar Menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Mostrar Mais ({hiddenCount})
                </>
              )}
            </Button>
          </div>
        )}
        
        {analises.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white/50 rounded-lg">
            <p className="text-lg">Nenhuma análise encontrada</p>
            <p className="text-sm mt-2">Utilize a busca para encontrar análises específicas</p>
          </div>
        )}
      </div>
    );
  }
);

TarotAnalysisListOptimized.displayName = 'TarotAnalysisListOptimized';

export default TarotAnalysisListOptimized;
