import React, { useState, memo, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Calendar, AlertTriangle, CreditCard, ChevronDown, ChevronUp, Check, X, Clock, Package } from "lucide-react";
import AtendimentoPacoteButton from "./AtendimentoPacoteButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PlanoMonthsVisualizer from "@/components/PlanoMonthsVisualizer";
import SemanalMonthsVisualizer from "@/components/SemanalMonthsVisualizer";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";


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
  pacoteAtivo?: boolean;
  pacoteData?: {
    dias: string;
    pacoteDias: Array<{
      id: string;
      data: string;
      valor: string;
    }>;
  } | null;
}

interface AtendimentosTableOptimizedProps {
  atendimentos: Atendimento[];
  onDeleteAtendimento: (id: string) => void;
}

const AtendimentosTableOptimized = memo<AtendimentosTableOptimizedProps>(({ atendimentos, onDeleteAtendimento }) => {
  const navigate = useNavigate();
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
    const currentAtendimentos = getAtendimentos();
    const updatedAtendimentos = currentAtendimentos.map(atendimento => 
      atendimento.id === atendimentoId 
        ? { ...atendimento, statusPagamento: newStatus }
        : atendimento
    );
    
    saveAtendimentos(updatedAtendimentos);

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
    
    window.location.reload();
  }, [getAtendimentos, saveAtendimentos, getPlanos, savePlanos, atendimentos]);

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

  const getStatusBadge = useCallback((status?: string) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'parcelado':
        return <Badge className="bg-red-100 text-red-800">Parcelado</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  }, []);

  const getTipoServicoLabel = useCallback((tipo: string) => {
    switch (tipo) {
      case 'tarot':
        return 'Tarot';
      case 'terapia':
        return 'Terapia';
      case 'mesa-radionica':
        return 'Mesa Radiônica';
      default:
        return tipo;
    }
  }, []);

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
              {atendimentos.map((atendimento) => (
                <React.Fragment key={atendimento.id}>
                  <TableRow className="border-b border-slate-100">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-slate-900">{atendimento.nome}</div>
                          {atendimento.signo && (
                            <div className="text-sm text-slate-500">{atendimento.signo}</div>
                          )}
                        </div>
                        {atendimento.atencaoFlag && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(atendimento.dataAtendimento)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {getTipoServicoLabel(atendimento.tipoServico)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      R$ {parseFloat(atendimento.valor || '0').toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(atendimento.statusPagamento)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1 h-6"
                            >
                              Alterar
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white border shadow-lg z-50">
                            <DropdownMenuItem 
                              onClick={() => updatePaymentStatus(atendimento.id, 'pago')}
                              className="text-green-600"
                            >
                              <Check className="h-3 w-3 mr-2" />
                              Marcar como Pago
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updatePaymentStatus(atendimento.id, 'pendente')}
                              className="text-yellow-600"
                            >
                              <Clock className="h-3 w-3 mr-2" />
                              Marcar como Pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updatePaymentStatus(atendimento.id, 'parcelado')}
                              className="text-red-600"
                            >
                              <X className="h-3 w-3 mr-2" />
                              Marcar como Parcelado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {atendimento.planoAtivo && atendimento.planoData && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {atendimento.planoData.meses}x
                          </Badge>
                        )}
                        {atendimento.semanalAtivo && atendimento.semanalData && (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            {atendimento.semanalData.semanas}s
                          </Badge>
                        )}
                        {atendimento.pacoteAtivo && atendimento.pacoteData && (
                          <AtendimentoPacoteButton 
                            pacoteData={atendimento.pacoteData}
                            clientName={atendimento.nome}
                            atendimentoId={atendimento.id}
                          />
                        )}
                        {((atendimento.planoAtivo && atendimento.planoData) || (atendimento.semanalAtivo && atendimento.semanalData) || (atendimento.pacoteAtivo && atendimento.pacoteData)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(atendimento.id)}
                            className="h-6 w-6 p-0"
                          >
                            {expandedRows.has(atendimento.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/editar-atendimento/${atendimento.id}`)}
                          className="text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border shadow-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o atendimento de {atendimento.nome}? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDeleteAtendimento(atendimento.id)}
                                className="bg-red-600"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(atendimento.id) && (
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

AtendimentosTableOptimized.displayName = 'AtendimentosTableOptimized';

export default AtendimentosTableOptimized;