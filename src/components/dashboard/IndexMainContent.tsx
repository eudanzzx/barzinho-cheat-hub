
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import AtendimentosTable from "@/components/dashboard/AtendimentosTable";
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum atendimento encontrado
          </h3>
          <p className="text-gray-500 text-center">
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
    <>
      {isMobile ? (
        <AtendimentosCompactTable 
          atendimentos={filteredAtendimentos}
          onDeleteAtendimento={onDeleteAtendimento}
        />
      ) : (
        <AtendimentosTable 
          atendimentos={filteredAtendimentos}
          onDeleteAtendimento={onDeleteAtendimento}
        />
      )}
    </>
  );
});

IndexMainContent.displayName = 'IndexMainContent';

export default IndexMainContent;
