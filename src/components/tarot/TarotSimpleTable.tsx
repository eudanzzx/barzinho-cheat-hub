import React, { memo, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PlanoPaymentButton from "./PlanoPaymentButton";
import SemanalPaymentButton from "./SemanalPaymentButton";

interface TarotAnalise {
  id: string;
  nomeCliente?: string;
  clientName?: string;
  dataAtendimento: string;
  valor?: string;
  finalizado?: boolean;
  tipoServico?: string;
  dataNascimento?: string;
  planoAtivo?: boolean;
  planoData?: {
    meses: string;
    valorMensal: string;
    diaVencimento?: string;
  };
  semanalAtivo?: boolean;
  semanalData?: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  };
}

interface TarotSimpleTableProps {
  analises: TarotAnalise[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFinished: (id: string) => void;
}

const TarotSimpleTable: React.FC<TarotSimpleTableProps> = memo(({
  analises,
  onEdit,
  onDelete,
  onToggleFinished
}) => {
  const handleEdit = useCallback((id: string) => {
    onEdit(id);
  }, [onEdit]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta análise?')) {
      onDelete(id);
    }
  }, [onDelete]);

  const handleToggle = useCallback((id: string) => {
    onToggleFinished(id);
  }, [onToggleFinished]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '';
    
    // Se já está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Para outros formatos, tenta conversão normal
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  const formatValue = useCallback((value?: string) => {
    if (!value) return 'R$ 0,00';
    const numValue = parseFloat(value.toString());
    return numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }, []);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {analises.map((analise) => {
            const clientName = analise.nomeCliente || analise.clientName || 'Cliente não informado';
            const isFinished = analise.finalizado;
            
            return (
              <div
                key={analise.id}
                className={cn(
                  "p-4",
                  isFinished && "bg-green-50"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {clientName}
                      </h3>
                      <Badge
                        variant={isFinished ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          isFinished 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        )}
                      >
                        {isFinished ? "Finalizada" : "Em Andamento"}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                      <span>Data: {formatDate(analise.dataAtendimento)}</span>
                      <span>Valor: {formatValue(analise.valor)}</span>
                      {analise.tipoServico && (
                        <span>Tipo: {analise.tipoServico}</span>
                      )}
                    </div>

                    {/* Controles de Pagamento */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {analise.planoAtivo && analise.planoData && (
                        <PlanoPaymentButton
                          analysisId={analise.id}
                          clientName={clientName}
                          planoData={analise.planoData}
                          startDate={analise.dataAtendimento}
                        />
                      )}
                      
                      {analise.semanalAtivo && analise.semanalData && (
                        <SemanalPaymentButton
                          analysisId={analise.id}
                          clientName={clientName}
                          semanalData={analise.semanalData}
                          startDate={analise.dataAtendimento}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(analise.id)}
                      className={cn(
                        "text-xs",
                        isFinished 
                          ? "border-green-200 text-green-700" 
                          : "border-blue-200 text-blue-700"
                      )}
                    >
                      {isFinished ? (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Reabrir
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Finalizar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(analise.id)}
                      className="text-xs border-gray-200 text-gray-700"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(analise.id)}
                      className="text-xs border-red-200 text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

TarotSimpleTable.displayName = 'TarotSimpleTable';

export default TarotSimpleTable;