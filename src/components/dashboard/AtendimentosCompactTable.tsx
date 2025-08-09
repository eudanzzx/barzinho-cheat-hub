import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Calendar, User, DollarSign, Check, X, CreditCard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import AtendimentoPacoteButton from "./AtendimentoPacoteButton";

interface AtendimentoData {
  id: string;
  nome: string;
  dataNascimento?: string;
  tipoServico: string;
  statusPagamento: 'pago' | 'pendente' | 'parcelado';
  dataAtendimento: string;
  valor: string;
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

interface AtendimentosCompactTableProps {
  atendimentos: AtendimentoData[];
  onDeleteAtendimento: (id: string) => void;
}

const AtendimentosCompactTable: React.FC<AtendimentosCompactTableProps> = ({
  atendimentos,
  onDeleteAtendimento,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [planos, setPlanos] = useState<(PlanoMensal | PlanoSemanal)[]>([]);
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      loadPlanos();
    };

    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
    };
  }, []);

  const loadPlanos = () => {
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    // CARREGAR TODOS OS PLANOS - INCLUINDO PAGOS E PENDENTES
    const filteredPlanos = allPlanos.filter((plano) => 
      (plano.type === 'plano' || plano.type === 'semanal') && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );

    setPlanos(filteredPlanos);
  };

  const handlePaymentToggle = (planoId: string, clientName: string, isPaid: boolean) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === planoId ? { ...plano, active: !isPaid } : plano
    );
    
    savePlanos(updatedPlanos);
    toast.success(
      isPaid 
        ? `Pagamento de ${clientName} marcado como pago!`
        : `Pagamento de ${clientName} marcado como pendente!`
    );
    
    window.dispatchEvent(new Event('atendimentosUpdated'));
    loadPlanos();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Se já está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Para outros formatos, tenta conversão normal
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Pago</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      case 'parcelado':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Parcelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value || '0');
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  const getMonthlyPlanos = (clientName: string) => {
    return planos.filter(p => p.type === 'plano' && p.clientName === clientName) as PlanoMensal[];
  };

  const getWeeklyPlanos = (clientName: string) => {
    return planos.filter(p => p.type === 'semanal' && p.clientName === clientName) as PlanoSemanal[];
  };

  const getDiaVencimentoDisplay = (diaVencimento?: string) => {
    if (diaVencimento) {
      const parsedDay = parseInt(diaVencimento);
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        return `dia ${parsedDay}`;
      }
    }
    return 'dia 5';
  };

  const getDiaVencimentoSemanalDisplay = (diaVencimento?: string) => {
    const diaLabels: { [key: string]: string } = {
      'segunda': 'segunda-feira',
      'terca': 'terça-feira', 
      'quarta': 'quarta-feira',
      'quinta': 'quinta-feira',
      'sexta': 'sexta-feira',
      'sabado': 'sábado',
      'domingo': 'domingo'
    };
    
    return diaLabels[diaVencimento || 'sexta'] || 'sexta-feira';
  };

  const togglePaymentExpansion = (clientName: string) => {
    const newExpanded = new Set(expandedPayments);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedPayments(newExpanded);
  };

  return (
    <div className="space-y-4">
      {atendimentos.map((atendimento) => {
        const clientMonthlyPlanos = getMonthlyPlanos(atendimento.nome);
        const clientWeeklyPlanos = getWeeklyPlanos(atendimento.nome);
        const hasMonthlyPayments = clientMonthlyPlanos.length > 0;
        const hasWeeklyPayments = clientWeeklyPlanos.length > 0;
        const isPaymentExpanded = expandedPayments.has(atendimento.nome);

        return (
          <div
            key={atendimento.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{atendimento.nome}</h3>
                      {isMobile && (hasMonthlyPayments || hasWeeklyPayments) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePaymentExpansion(atendimento.nome)}
                          className="p-1 h-auto"
                        >
                          <div className="flex items-center gap-1">
                            {hasMonthlyPayments && (
                              <>
                                <CreditCard className="h-4 w-4 text-[#0553C7]" />
                                <Badge 
                                  variant="secondary" 
                                  className="bg-[#0553C7]/10 text-[#0553C7] border-[#0553C7]/20 text-xs px-1.5 py-0.5"
                                >
                                  {clientMonthlyPlanos.length}
                                </Badge>
                              </>
                            )}
                            {hasWeeklyPayments && (
                              <>
                                <Calendar className="h-4 w-4 text-emerald-600 ml-1" />
                                <Badge 
                                  variant="secondary" 
                                  className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-1.5 py-0.5"
                                >
                                  {clientWeeklyPlanos.length}
                                </Badge>
                              </>
                            )}
                            <ChevronDown className={cn(
                              "h-4 w-4 text-gray-600 transition-transform duration-300",
                              isPaymentExpanded && "rotate-180"
                            )} />
                          </div>
                        </Button>
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

              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/editar-atendimento/${atendimento.id}`)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteAtendimento(atendimento.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {(hasMonthlyPayments || hasWeeklyPayments) && (
              <>
                {isMobile ? (
                  <Collapsible open={isPaymentExpanded} onOpenChange={() => togglePaymentExpansion(atendimento.nome)}>
                    <CollapsibleContent>
                      {hasMonthlyPayments && (
                        <Card className="border-gray-200 mb-4">
                          <CardHeader className="bg-gray-50 border-b pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                                <CreditCard className="h-4 w-4" />
                                Pagamentos Mensais
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-2">
                                  {clientMonthlyPlanos.filter(p => !p.active).length}/{clientMonthlyPlanos.length}
                                </Badge>
                              </CardTitle>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {clientMonthlyPlanos.map((plano) => {
                                const isPaid = !plano.active;
                                return (
                                  <Button
                                    key={plano.id}
                                    onClick={() => handlePaymentToggle(plano.id, atendimento.nome, !isPaid)}
                                    variant="outline"
                                    className={`
                                      w-full p-4 h-auto flex items-center justify-between
                                      ${isPaid 
                                        ? 'bg-green-50 border-green-200 text-green-800' 
                                        : 'bg-red-50 border-red-200 text-red-800'
                                      }
                                    `}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`p-1 rounded-full ${isPaid ? 'bg-green-200' : 'bg-red-200'}`}>
                                        {isPaid ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <X className="h-4 w-4" />
                                        )}
                                      </div>
                                      <div className="text-left">
                                        <div className="font-medium">
                                          {plano.month}º Mês
                                        </div>
                                        <div className="text-sm opacity-75">
                                          Vencimento: {formatDate(plano.dueDate)}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge variant={isPaid ? "default" : "destructive"}>
                                      {isPaid ? 'Pago' : 'Pendente'}
                                    </Badge>
                                  </Button>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {hasWeeklyPayments && (
                        <Card className="border-gray-200">
                          <CardHeader className="bg-gray-50 border-b pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                                <Calendar className="h-4 w-4" />
                                Pagamentos Semanais
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 ml-2">
                                  {clientWeeklyPlanos.filter(p => !p.active).length}/{clientWeeklyPlanos.length}
                                </Badge>
                              </CardTitle>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {clientWeeklyPlanos.map((plano) => {
                                const isPaid = !plano.active;
                                return (
                                  <Button
                                    key={plano.id}
                                    onClick={() => handlePaymentToggle(plano.id, atendimento.nome, !isPaid)}
                                    variant="outline"
                                    className={`
                                      w-full p-4 h-auto flex items-center justify-between
                                      ${isPaid 
                                        ? 'bg-green-50 border-green-200 text-green-800' 
                                        : 'bg-red-50 border-red-200 text-red-800'
                                      }
                                    `}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`p-1 rounded-full ${isPaid ? 'bg-green-200' : 'bg-red-200'}`}>
                                        {isPaid ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <X className="h-4 w-4" />
                                        )}
                                      </div>
                                      <div className="text-left">
                                        <div className="font-medium">
                                          {plano.week}ª Semana
                                        </div>
                                        <div className="text-sm opacity-75">
                                          Vencimento: {formatDate(plano.dueDate)}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge variant={isPaid ? "default" : "destructive"}>
                                      {isPaid ? 'Pago' : 'Pendente'}
                                    </Badge>
                                  </Button>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <>
                    {hasMonthlyPayments && (
                      <Card className="border-gray-200 mb-4">
                        <CardHeader className="bg-gray-50 border-b pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                              <CreditCard className="h-4 w-4" />
                              Controle de Pagamentos Mensal - Vencimento todo {getDiaVencimentoDisplay(atendimento.planoData?.diaVencimento)}
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-2">
                                {clientMonthlyPlanos.filter(p => !p.active).length}/{clientMonthlyPlanos.length}
                              </Badge>
                            </CardTitle>
                            <div className="text-sm text-gray-600">
                              R$ {clientMonthlyPlanos.filter(p => !p.active).reduce((sum, p) => sum + p.amount, 0).toFixed(2)} / R$ {clientMonthlyPlanos.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {clientMonthlyPlanos.map((plano) => {
                              const isPaid = !plano.active;
                              return (
                                <Button
                                  key={plano.id}
                                  onClick={() => handlePaymentToggle(plano.id, atendimento.nome, !isPaid)}
                                  variant="outline"
                                  className={`
                                    w-full p-4 h-auto flex items-center justify-between
                                    ${isPaid 
                                      ? 'bg-green-50 border-green-200 text-green-800' 
                                      : 'bg-red-50 border-red-200 text-red-800'
                                    }
                                  `}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full ${isPaid ? 'bg-green-200' : 'bg-red-200'}`}>
                                      {isPaid ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <X className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div className="text-left">
                                      <div className="font-medium">
                                        {plano.month}º Mês
                                      </div>
                                      <div className="text-sm opacity-75">
                                        Vencimento: {formatDate(plano.dueDate)}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant={isPaid ? "default" : "destructive"}>
                                    {isPaid ? 'Pago' : 'Pendente'}
                                  </Badge>
                                </Button>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {hasWeeklyPayments && (
                      <Card className="border-gray-200">
                        <CardHeader className="bg-gray-50 border-b pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                              <Calendar className="h-4 w-4" />
                              Controle de Pagamentos Semanal - Vencimento toda {getDiaVencimentoSemanalDisplay(atendimento.semanalData?.diaVencimento)}
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 ml-2">
                                {clientWeeklyPlanos.filter(p => !p.active).length}/{clientWeeklyPlanos.length}
                              </Badge>
                            </CardTitle>
                            <div className="text-sm text-gray-600">
                              R$ {clientWeeklyPlanos.filter(p => !p.active).reduce((sum, p) => sum + p.amount, 0).toFixed(2)} / R$ {clientWeeklyPlanos.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {clientWeeklyPlanos.map((plano) => {
                              const isPaid = !plano.active;
                              return (
                                <Button
                                  key={plano.id}
                                  onClick={() => handlePaymentToggle(plano.id, atendimento.nome, !isPaid)}
                                  variant="outline"
                                  className={`
                                    w-full p-4 h-auto flex items-center justify-between
                                    ${isPaid 
                                      ? 'bg-green-50 border-green-200 text-green-800' 
                                      : 'bg-red-50 border-red-200 text-red-800'
                                    }
                                  `}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full ${isPaid ? 'bg-green-200' : 'bg-red-200'}`}>
                                      {isPaid ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <X className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div className="text-left">
                                      <div className="font-medium">
                                        {plano.week}ª Semana
                                      </div>
                                      <div className="text-sm opacity-75">
                                        Vencimento: {formatDate(plano.dueDate)}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant={isPaid ? "default" : "destructive"}>
                                    {isPaid ? 'Pago' : 'Pendente'}
                                  </Badge>
                                </Button>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </>
            )}

            {/* Pacotes Section */}
            {atendimento.pacoteAtivo && atendimento.pacoteData && (
              <div className="mt-4">
                <AtendimentoPacoteButton
                  pacoteData={atendimento.pacoteData}
                  clientName={atendimento.nome}
                  atendimentoId={atendimento.id}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AtendimentosCompactTable;
