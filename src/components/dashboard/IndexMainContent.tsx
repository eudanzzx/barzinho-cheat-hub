
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import AtendimentosTableOptimized from "@/components/dashboard/AtendimentosTableOptimized";
import AtendimentosCompactTable from "@/components/dashboard/AtendimentosCompactTable";
import { useIsMobile } from "@/hooks/use-mobile";

interface IndexMainContentProps {
  filteredAtendimentos: any[];
  searchTerm: string;
  onDeleteAtendimento: (id: string) => void;
}

const IndexMainContent: React.FC<IndexMainContentProps> = React.memo(({
  filteredAtendimentos,
  searchTerm,
  onDeleteAtendimento
}) => {
  const isMobile = useIsMobile();

  if (filteredAtendimentos.length === 0) {
    return (
      <Card className="mx-2 sm:mx-0">
        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
          <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">
            Nenhum atendimento encontrado
          </h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-md">
            {searchTerm 
              ? "Não há atendimentos que correspondam à sua busca."
              : "Não há atendimentos registrados para este período."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="px-2 sm:px-0 space-y-4">
      {/* Tabela de Atendimentos */}
      {isMobile ? (
        <AtendimentosCompactTable 
          atendimentos={filteredAtendimentos}
          onDeleteAtendimento={onDeleteAtendimento}
        />
      ) : (
      <AtendimentosTableOptimized 
        atendimentos={filteredAtendimentos} 
        onDeleteAtendimento={onDeleteAtendimento}
      />
      )}
    </div>
  );
});

IndexMainContent.displayName = 'IndexMainContent';

export default IndexMainContent;
