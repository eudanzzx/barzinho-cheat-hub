import React, { useState, useCallback, useMemo, memo } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import PlanoMonthsVisualizer from "@/components/PlanoMonthsVisualizer";
import SemanalMonthsVisualizer from "@/components/SemanalMonthsVisualizer";
import AtendimentoTableRow from './AtendimentoTableRow';

interface Atendimento {
  id: string;
  nome: string;
  dataAtendimento: string;
  tipoServico: string;
  valor: string;
  statusPagamento?: 'pago' | 'pendente' | 'parcelado';
  dataNascimento?: string;
  signo?: string;
  destino?: string;
  ano?: string;
  detalhes?: string;
  tratamento?: string;
  indicacao?: string;
  atencaoFlag?: boolean;
  atencaoNota?: string;
  planoAtivo?: boolean;
  planoData?: {
    meses: string;
    valorMensal: string;
  } | null;
  semanalAtivo?: boolean;
  semanalData?: {
    semanas: string;
    valorSemanal: string;
  } | null;
}

interface OptimizedAtendimentosTableProps {
  atendimentos: Atendimento[];
  onDeleteAtendimento: (id: string) => void;
}

const OptimizedAtendimentosTable = memo<OptimizedAtendimentosTableProps>(({ 
  atendimentos, 
  onDeleteAtendimento 
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { getAtendimentos, saveAtendimentos, getPlanos, savePlanos } = useUserDataService();

  const toggleRowExpansion = useCallback((id: string) => {
    setExpandedRows(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const updatePaymentStatus = useCallback((atendimentoId: string, newStatus: 'pago' | 'pendente' | 'parcelado') => {
    // Atualizar o status do atendimento
    const currentAtendimentos = getAtendimentos();
    const updatedAtendimentos = currentAtendimentos.map(atendimento => 
      atendimento.id === atendimentoId 
        ? { ...atendimento, statusPagamento: newStatus }
        : atendimento
    );
    
    saveAtendimentos(updatedAtendimentos);

    // Se marcado como pago, desativar planos relacionados
    if (newStatus === 'pago') {
      const currentPlanos = getPlanos();
      const updatedPlanos = currentPlanos.map(plano => {
        if (plano.id.includes(atendimentoId) || plano.analysisId === atendimentoId) {
          return { ...plano, active: false };
        }
        return plano;
      });
      savePlanos(updatedPlanos);
    }
    
    const atendimento = atendimentos.find(a => a.id === atendimentoId);
    const statusLabel = newStatus === 'pago' ? 'pago' : newStatus === 'pendente' ? 'pendente' : 'parcelado';
    toast.success(`💫 Status de ${atendimento?.nome} alterado para ${statusLabel}!`);
    
    // Forçar recarregamento da página para refletir as mudanças
    window.location.reload();
  }, [getAtendimentos, saveAtendimentos, getPlanos, savePlanos, atendimentos]);

  const atendimentosWithExpansion = useMemo(() => {
    return atendimentos.map(atendimento => ({
      ...atendimento,
      isExpanded: expandedRows.has(atendimento.id)
    }));
  }, [atendimentos, expandedRows]);

  if (atendimentos.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum atendimento encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Lista de Atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Cliente</TableHead>
                <TableHead className="font-semibold text-slate-700">Data</TableHead>
                <TableHead className="font-semibold text-slate-700">Serviço</TableHead>
                <TableHead className="font-semibold text-slate-700">Valor</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Planos</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atendimentosWithExpansion.map((atendimento) => (
                <React.Fragment key={atendimento.id}>
                  <AtendimentoTableRow
                    atendimento={atendimento}
                    isExpanded={atendimento.isExpanded}
                    onToggleExpansion={toggleRowExpansion}
                    onUpdatePaymentStatus={updatePaymentStatus}
                    onDelete={onDeleteAtendimento}
                  />
                  {atendimento.isExpanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <div className="p-4 bg-slate-50/50">
                          {atendimento.planoAtivo && atendimento.planoData && (
                            <PlanoMonthsVisualizer atendimento={atendimento} />
                          )}
                          {atendimento.semanalAtivo && atendimento.semanalData && (
                            <SemanalMonthsVisualizer atendimento={atendimento} />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedAtendimentosTable.displayName = 'OptimizedAtendimentosTable';

export default OptimizedAtendimentosTable;