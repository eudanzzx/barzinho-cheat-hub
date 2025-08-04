import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, User, AlertTriangle, ChevronDown, ChevronUp, CreditCard, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import AtendimentoMonthlyPaymentButton from "./AtendimentoMonthlyPaymentButton";
import AtendimentoWeeklyPaymentButton from "./AtendimentoWeeklyPaymentButton";

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
    diaVencimento?: string;
  } | null;
  semanalAtivo?: boolean;
  semanalData?: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  } | null;
}

interface AtendimentosCompactTableProps {
  atendimentos: Atendimento[];
  onEditAtendimento: (id: string) => void;
  onDeleteAtendimento: (id: string) => void;
}

const AtendimentosCompactTable: React.FC<AtendimentosCompactTableProps> = ({ 
  atendimentos, 
  onEditAtendimento, 
  onDeleteAtendimento 
}) => {
  const isMobile = useIsMobile();
  const { getPlanos, savePlanos } = useUserDataService();
  const [planos, setPlanos] = useState<(PlanoMensal | PlanoSemanal)[]>([]);
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadPlanos = () => {
      const allPlanos = getPlanos();
      setPlanos(allPlanos);
    };

    loadPlanos();
    const handlePlanosUpdated = () => loadPlanos();
    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    return () => window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
  }, [getPlanos]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Se já está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateSafe = (dateString: string) => {
    if (!dateString) return 'Data não informada';
    
    try {
      // Se já está no formato YYYY-MM-DD, converte para DD/MM/YYYY
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Para outros formatos, tenta conversão normal
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Pago</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      case 'parcelado':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Parcelado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pendente</Badge>;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'parcelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  const renderAtendimentos = () => {
    if (atendimentos.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum atendimento encontrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {atendimentos.map((atendimento) => {
          // Verificar se tem planos ativos usando os dados do atendimento
          const hasMonthlyPayments = Boolean(
            atendimento.planoAtivo && 
            atendimento.planoData && 
            atendimento.planoData.meses && 
            atendimento.planoData.valorMensal
          );

          const hasWeeklyPayments = Boolean(
            atendimento.semanalAtivo && 
            atendimento.semanalData && 
            atendimento.semanalData.semanas && 
            atendimento.semanalData.valorSemanal
          );

          return (
            <Card key={atendimento.id} className="bg-white/80 border border-[#ede9fe]">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  {/* Header com informações principais */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{atendimento.nome}</h3>
                            {atendimento.atencaoFlag && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{atendimento.tipoServico}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(atendimento.dataAtendimento)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{formatCurrency(atendimento.valor)}</span>
                        </div>
                        <div>
                          {getStatusBadge(atendimento.statusPagamento)}
                        </div>
                      </div>
                    </div>

                    {/* Actions - Mobile */}
                    <div className="flex sm:hidden gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditAtendimento(atendimento.id)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteAtendimento(atendimento.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Botões de Pagamento - IGUAL AO TAROT */}
                  <div className="flex flex-col gap-2 w-full">
                    {/* Botão de Pagamentos Mensais */}
                    {hasMonthlyPayments && (
                      <div className="w-full">
                        <AtendimentoMonthlyPaymentButton
                          atendimentoId={atendimento.id}
                          clientName={atendimento.nome}
                          planoData={atendimento.planoData!}
                          startDate={atendimento.dataAtendimento}
                        />
                      </div>
                    )}

                    {/* Botão de Pagamentos Semanais */}
                    {hasWeeklyPayments && (
                      <div className="w-full">
                        <AtendimentoWeeklyPaymentButton
                          atendimentoId={atendimento.id}
                          clientName={atendimento.nome}
                          semanalData={atendimento.semanalData!}
                          startDate={atendimento.dataAtendimento}
                        />
                      </div>
                    )}
                  </div>

                  {/* Desktop actions - hidden on mobile */}
                  <div className="hidden sm:flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditAtendimento(atendimento.id)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteAtendimento(atendimento.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Atendimentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderAtendimentos()}
      </CardContent>
    </Card>
  );
};

export default AtendimentosCompactTable;