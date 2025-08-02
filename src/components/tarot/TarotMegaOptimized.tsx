import React, { memo, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import TarotSimpleTable from "./TarotSimpleTable";

interface TarotMegaOptimizedProps {
  analises: any[];
  onToggleFinished: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  counts: {
    finalizados: number;
    emAndamento: number;
    atencao: number;
  };
}

const TarotMegaOptimized: React.FC<TarotMegaOptimizedProps> = memo(({
  analises,
  onToggleFinished,
  onEdit,
  onDelete,
  searchTerm,
  activeTab,
  setActiveTab,
  counts
}) => {
  // Filtro otimizado igual ao principal
  const filteredAnalises = useMemo(() => {
    if (!analises.length) return [];
    
    return analises.filter(analise => {
      // Filtro por tab
      if (activeTab === 'finalizadas' && !analise.finalizado) return false;
      if (activeTab === 'em-andamento' && analise.finalizado) return false;
      if (activeTab === 'pendentes' && analise.finalizado) return false;
      if (activeTab === 'atencao' && !analise.atencaoFlag && !analise.attentionFlag) return false;
      
      // Filtro por busca
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const clientName = (analise.nomeCliente || analise.clientName || '').toLowerCase();
        return clientName.includes(searchLower);
      }
      
      return true;
    });
  }, [analises, activeTab, searchTerm]);

  const emptyStateContent = useMemo(() => (
    <Card className="mx-2 sm:mx-0">
      <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
        <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">
          Nenhuma análise encontrada
        </h3>
        <p className="text-sm sm:text-base text-gray-500 max-w-md">
          {searchTerm 
            ? "Não há análises que correspondam à sua busca."
            : "Não há análises registradas para este período."
          }
        </p>
      </CardContent>
    </Card>
  ), [searchTerm]);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white border border-gray-200 rounded-lg mb-4 gap-1 p-1 h-auto">
          <TabsTrigger
            value="todas"
            className="data-[state=active]:bg-tarot-primary data-[state=active]:text-white text-xs px-2 py-2 h-auto min-h-[2.5rem]"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm">Todas</span>
              <span className="text-xs">({analises.length})</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="finalizadas"
            className="data-[state=active]:bg-tarot-primary data-[state=active]:text-white text-xs px-2 py-2 h-auto min-h-[2.5rem]"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm">Finalizadas</span>
              <span className="text-xs">({counts.finalizados})</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="pendentes"
            className="data-[state=active]:bg-tarot-primary data-[state=active]:text-white text-xs px-2 py-2 h-auto min-h-[2.5rem]"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm">Pendentes</span>
              <span className="text-xs">({counts.emAndamento})</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="atencao"
            className="data-[state=active]:bg-tarot-primary data-[state=active]:text-white text-xs px-2 py-2 h-auto min-h-[2.5rem]"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm">Atenção</span>
              <span className="text-xs">({counts.atencao})</span>
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredAnalises.length === 0 ? (
        emptyStateContent
      ) : (
        <div className="px-2 sm:px-0">
          <TarotSimpleTable
            analises={filteredAnalises}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFinished={onToggleFinished}
          />
        </div>
      )}
    </>
  );
});

TarotMegaOptimized.displayName = 'TarotMegaOptimized';

export default TarotMegaOptimized;