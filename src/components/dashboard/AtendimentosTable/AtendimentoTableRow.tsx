import React, { memo, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, AlertTriangle, CreditCard, ChevronDown, ChevronUp, Package } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import PaymentStatusDropdown from './PaymentStatusDropdown';
import AtendimentoPacoteButton from "@/components/dashboard/AtendimentoPacoteButton";

interface Atendimento {
  id: string;
  nome: string;
  dataAtendimento: string;
  tipoServico: string;
  valor: string;
  statusPagamento?: 'pago' | 'pendente' | 'parcelado';
  signo?: string;
  atencaoFlag?: boolean;
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

interface AtendimentoTableRowProps {
  atendimento: Atendimento;
  isExpanded: boolean;
  onToggleExpansion: (id: string) => void;
  onUpdatePaymentStatus: (id: string, status: 'pago' | 'pendente' | 'parcelado') => void;
  onDelete: (id: string) => void;
}

const AtendimentoTableRow = memo<AtendimentoTableRowProps>(({
  atendimento,
  isExpanded,
  onToggleExpansion,
  onUpdatePaymentStatus,
  onDelete
}) => {
  const navigate = useNavigate();

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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pago</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
      case 'parcelado':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Parcelado</Badge>;
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

  const handleEdit = useCallback(() => {
    navigate(`/editar-atendimento/${atendimento.id}`);
  }, [navigate, atendimento.id]);

  const handleToggleExpansion = useCallback(() => {
    onToggleExpansion(atendimento.id);
  }, [onToggleExpansion, atendimento.id]);

  const handleDelete = useCallback(() => {
    onDelete(atendimento.id);
  }, [onDelete, atendimento.id]);

  const hasPlans = atendimento.planoAtivo && atendimento.planoData || atendimento.semanalAtivo && atendimento.semanalData;
  const hasPacote = atendimento.pacoteAtivo && atendimento.pacoteData;

  return (
    <TableRow className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
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
          <PaymentStatusDropdown 
            atendimentoId={atendimento.id}
            onUpdateStatus={onUpdatePaymentStatus}
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 flex-wrap">
          {atendimento.planoAtivo && atendimento.planoData && (
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
              <CreditCard className="h-3 w-3 mr-1" />
              {atendimento.planoData.meses}x
            </Badge>
          )}
          {atendimento.semanalAtivo && atendimento.semanalData && (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              <Calendar className="h-3 w-3 mr-1" />
              {atendimento.semanalData.semanas}s
            </Badge>
          )}
          {hasPacote && (
            <AtendimentoPacoteButton 
              pacoteData={atendimento.pacoteData}
              clientName={atendimento.nome}
              atendimentoId={atendimento.id}
            />
          )}
          {hasPlans && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpansion}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
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
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
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
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
});

AtendimentoTableRow.displayName = 'AtendimentoTableRow';

export default AtendimentoTableRow;