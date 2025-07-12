
import React, { memo, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from 'lucide-react';
import { Tabs } from "@/components/ui/tabs";
import TarotTabsFilterOptimized from "@/components/tarot/TarotTabsFilterOptimized";
import TarotAnalysisListOptimized from "@/components/tarot/TarotAnalysisListOptimized";

interface TarotListingContentProps {
  tabAnalises: any[];
  searchTerm: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  counts: {
    finalizados: number;
    emAndamento: number;
    atencao: number;
  };
  onToggleFinished: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TarotListingContent: React.FC<TarotListingContentProps> = memo(({
  tabAnalises,
  searchTerm,
  activeTab,
  setActiveTab,
  counts,
  onToggleFinished,
  onEdit,
  onDelete
}) => {
  const isEmpty = useMemo(() => tabAnalises.length === 0, [tabAnalises.length]);
  
  const emptyStateContent = useMemo(() => (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Nenhuma análise encontrada
        </h3>
        <p className="text-gray-500 text-center">
          {searchTerm
            ? "Não há análises que correspondam à sua busca."
            : "Não há análises frequenciais registradas."}
        </p>
      </CardContent>
    </Card>
  ), [searchTerm]);

  const listContent = useMemo(() => (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
      <CardContent className="p-4">
        <TarotAnalysisListOptimized
          analises={tabAnalises}
          onToggleFinished={onToggleFinished}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  ), [tabAnalises, onToggleFinished, onEdit, onDelete]);
  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TarotTabsFilterOptimized
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          total={tabAnalises.length}
          finalizados={counts.finalizados}
          emAndamento={counts.emAndamento}
          atencao={counts.atencao}
        />
      </Tabs>

      {isEmpty ? emptyStateContent : listContent}
    </>
  );
});

TarotListingContent.displayName = 'TarotListingContent';

export default TarotListingContent;
