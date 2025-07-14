import React, { memo, useMemo, useCallback, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Ultra componente otimizado que combina tudo em um só
const TarotMegaOptimized = memo(({
  analises,
  onToggleFinished,
  onEdit,
  onDelete,
  searchTerm,
  activeTab
}: {
  analises: any[];
  onToggleFinished: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  activeTab: string;
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Super filtro otimizado
  const filteredAnalises = useMemo(() => {
    if (!analises.length) return [];
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return analises.filter(analise => {
      // Filtro por tab
      if (activeTab === 'finalizadas' && !analise.finalizado) return false;
      if (activeTab === 'em-andamento' && analise.finalizado) return false;
      
      // Filtro por busca
      if (searchLower) {
        const clientName = (analise.nomeCliente || analise.clientName || '').toLowerCase();
        return clientName.includes(searchLower);
      }
      
      return true;
    });
  }, [analises, activeTab, searchTerm]);
  
  // Callbacks super otimizados
  const handleCardExpansion = useCallback((id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);
  
  const handleToggle = useCallback((id: string) => {
    onToggleFinished(id);
  }, [onToggleFinished]);
  
  const handleEditClick = useCallback((id: string) => {
    onEdit(id);
  }, [onEdit]);
  
  const handleDeleteClick = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);
  
  // Renderização ultra otimizada com virtualização simples
  const visibleAnalises = useMemo(() => {
    return filteredAnalises.slice(0, 10); // Máximo 10 itens por vez
  }, [filteredAnalises]);
  
  return (
    <div className="space-y-3">
      {visibleAnalises.map((analise) => {
        const isExpanded = expandedCards.has(analise.id);
        
        return (
          <Card key={analise.id} className="bg-white/80 border border-[#ede9fe]">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-slate-800">
                      {analise.nomeCliente || analise.clientName}
                    </h3>
                    <Badge
                      variant={analise.finalizado ? "default" : "secondary"}
                      className={cn(
                        analise.finalizado 
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      )}
                    >
                      {analise.finalizado ? "Finalizada" : "Em Andamento"}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCardExpansion(analise.id)}
                      className="p-1 h-auto"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      {analise.dataAtendimento && (
                        <p>Data: {new Date(analise.dataAtendimento).toLocaleDateString('pt-BR')}</p>
                      )}
                      {analise.valor && (
                        <p>Valor: R$ {analise.valor}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(analise.id)}
                    className="text-xs"
                  >
                    {analise.finalizado ? "Reabrir" : "Finalizar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(analise.id)}
                    className="text-xs"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(analise.id)}
                    className="text-xs"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {filteredAnalises.length > 10 && (
        <div className="text-center text-slate-500 text-sm">
          Mostrando 10 de {filteredAnalises.length} análises
        </div>
      )}
      
      {filteredAnalises.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>Nenhuma análise encontrada</p>
        </div>
      )}
    </div>
  );
});

TarotMegaOptimized.displayName = 'TarotMegaOptimized';

export default TarotMegaOptimized;