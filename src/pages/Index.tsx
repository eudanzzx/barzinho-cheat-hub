import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useUserDataService from "@/services/userDataService";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AtendimentosTable from "@/components/dashboard/AtendimentosTable";
import AtendimentosCompactTable from "@/components/dashboard/AtendimentosCompactTable";
import DashboardStats from "@/components/dashboard/DashboardStats";
import PeriodDropdown from "@/components/dashboard/PeriodDropdown";
import PaymentOverviewModal from "@/components/PaymentOverviewModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Search, 
  CreditCard,
  Clock,
  AlertTriangle 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const Index: React.FC = () => {
  const { getAtendimentos, checkClientBirthday, getPlanos, saveAtendimentos } = useUserDataService();
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [filteredAtendimentos, setFilteredAtendimentos] = useState<any[]>([]);
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState<'semana' | 'mes' | 'ano' | 'total'>('mes');
  const [searchTerm, setSearchTerm] = useState('');
  const [aniversarianteHoje, setAniversarianteHoje] = useState<{ nome: string; dataNascimento: string } | null>(null);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);
  const isMobile = useIsMobile();

  const loadAtendimentos = useCallback(() => {
    const allAtendimentos = getAtendimentos();
    setAtendimentos(allAtendimentos);
    filterAtendimentos(allAtendimentos, periodoVisualizacao, searchTerm);

    // Verificar aniversariante do dia
    const today = new Date().toISOString().slice(0, 10);
    const aniversariante = allAtendimentos.find(atendimento => {
      if (!atendimento.dataNascimento) return false;
      const birthDate = new Date(atendimento.dataNascimento).toISOString().slice(0, 10);
      return checkClientBirthday(birthDate);
    });

    if (aniversariante) {
      setAniversarianteHoje({
        nome: aniversariante.nome,
        dataNascimento: aniversariante.dataNascimento
      });
    } else {
      setAniversarianteHoje(null);
    }
  }, [getAtendimentos, periodoVisualizacao, searchTerm, checkClientBirthday]);

  const loadUpcomingPayments = useCallback(() => {
    const allPlanos = getPlanos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const upcomingPlanos = allPlanos.filter(plano => {
      if (!plano.active || plano.analysisId) return false;
      
      const dueDate = new Date(plano.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate >= today && dueDate <= nextWeek;
    });

    upcomingPlanos.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    setUpcomingPayments(upcomingPlanos.slice(0, 5));
  }, [getPlanos]);

  useEffect(() => {
    loadAtendimentos();
    loadUpcomingPayments();
  }, [loadAtendimentos, loadUpcomingPayments]);

  const filterAtendimentos = (atendimentos: any[], periodo: 'semana' | 'mes' | 'ano' | 'total', searchTerm: string) => {
    const now = new Date();
    let dataInicio: Date;

    switch (periodo) {
      case 'semana':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        dataInicio = new Date(now.setDate(diff));
        break;
      case 'mes':
        dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'ano':
        dataInicio = new Date(now.getFullYear(), 0, 1);
        break;
      case 'total':
        dataInicio = new Date(0);
        break;
      default:
        dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const atendimentosFiltrados = atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.dataAtendimento);
      const correspondePeriodo = periodo === 'total' || dataAtendimento >= dataInicio;

      const termoPesquisa = searchTerm.toLowerCase().trim();
      const correspondeTermo = atendimento.nome.toLowerCase().includes(termoPesquisa);

      return correspondePeriodo && correspondeTermo;
    });

    setFilteredAtendimentos(atendimentosFiltrados);
  };

  useEffect(() => {
    filterAtendimentos(atendimentos, periodoVisualizacao, searchTerm);
  }, [atendimentos, periodoVisualizacao, searchTerm]);

  useEffect(() => {
    const handleDataUpdated = () => {
      loadAtendimentos();
      loadUpcomingPayments();
    };

    window.addEventListener('atendimentosUpdated', handleDataUpdated);
    window.addEventListener('planosUpdated', handleDataUpdated);

    return () => {
      window.removeEventListener('atendimentosUpdated', handleDataUpdated);
      window.removeEventListener('planosUpdated', handleDataUpdated);
    };
  }, [loadAtendimentos, loadUpcomingPayments]);

  const calculateStats = useMemo(() => {
    const totalAtendimentos = filteredAtendimentos.length;
    
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const totalRecebido = atendimentos
      .filter(a => a.statusPagamento === 'pago')
      .reduce((sum, a) => sum + parseFloat(a.valor || '0'), 0);

    const totalRecebidoSemana = atendimentos
      .filter(a => {
        const date = new Date(a.dataAtendimento);
        return date >= weekStart && a.statusPagamento === 'pago';
      })
      .reduce((sum, a) => sum + parseFloat(a.valor || '0'), 0);

    const totalRecebidoMes = atendimentos
      .filter(a => {
        const date = new Date(a.dataAtendimento);
        return date >= monthStart && a.statusPagamento === 'pago';
      })
      .reduce((sum, a) => sum + parseFloat(a.valor || '0'), 0);

    const totalRecebidoAno = atendimentos
      .filter(a => {
        const date = new Date(a.dataAtendimento);
        return date >= yearStart && a.statusPagamento === 'pago';
      })
      .reduce((sum, a) => sum + parseFloat(a.valor || '0'), 0);

    const atendimentosSemana = atendimentos.filter(a => {
      const date = new Date(a.dataAtendimento);
      return date >= weekStart;
    }).length;

    return {
      totalAtendimentos,
      atendimentosSemana,
      totalRecebido,
      totalRecebidoSemana,
      totalRecebidoMes,
      totalRecebidoAno
    };
  }, [filteredAtendimentos, atendimentos]);

  const handleDeleteAtendimento = (id: string) => {
    const updatedAtendimentos = atendimentos.filter(a => a.id !== id);
    saveAtendimentos(updatedAtendimentos);
    toast.success('Atendimento excluído com sucesso!');
    window.dispatchEvent(new Event('atendimentosUpdated'));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntilDue: number) => {
    if (daysUntilDue === 0) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (daysUntilDue === 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (daysUntilDue <= 3) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getUrgencyText = (daysUntilDue: number) => {
    if (daysUntilDue === 0) return 'Vence hoje';
    if (daysUntilDue === 1) return 'Vence amanhã';
    return `${daysUntilDue} dias restantes`;
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4">
        {aniversarianteHoje && (
          <ClientBirthdayAlert 
            clientName={aniversarianteHoje.nome}
            birthDate={aniversarianteHoje.dataNascimento}
            context="atendimento"
          />
        )}

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dashboard Principal
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie seus atendimentos e acompanhe estatísticas
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <PaymentOverviewModal context="principal">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Todos os Vencimentos
                </Button>
              </PaymentOverviewModal>
            </div>
          </div>

          {upcomingPayments.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Calendar className="h-5 w-5" />
                  Próximos Vencimentos
                  <Badge variant="secondary" className="bg-blue-100 text-blue-600 border-blue-200">
                    {upcomingPayments.length} {upcomingPayments.length === 1 ? 'vencimento' : 'vencimentos'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingPayments.map((payment) => {
                    const daysUntilDue = getDaysUntilDue(payment.dueDate);
                    const urgencyColor = getUrgencyColor(daysUntilDue);
                    
                    return (
                      <div
                        key={payment.id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${urgencyColor}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {payment.type === 'plano' ? (
                              <CreditCard className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                            <span className="font-semibold text-slate-800">
                              {payment.clientName}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`${urgencyColor} font-medium text-xs`}
                            >
                              {payment.type === 'plano' ? 'Mensal' : 'Semanal'}
                            </Badge>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            R$ {payment.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">
                              {formatDate(payment.dueDate)}
                            </span>
                          </div>
                          <span className="font-medium">
                            {getUrgencyText(daysUntilDue)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <DashboardStats 
            totalAtendimentos={calculateStats.totalAtendimentos}
            atendimentosSemana={calculateStats.atendimentosSemana}
            totalRecebido={calculateStats.totalRecebido}
            totalRecebidoSemana={calculateStats.totalRecebidoSemana}
            totalRecebidoMes={calculateStats.totalRecebidoMes}
            totalRecebidoAno={calculateStats.totalRecebidoAno}
            selectedPeriod={periodoVisualizacao}
            onPeriodChange={setPeriodoVisualizacao}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <PeriodDropdown 
                selectedPeriod={periodoVisualizacao}
                onPeriodChange={setPeriodoVisualizacao}
              />
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>

          {filteredAtendimentos.length === 0 ? (
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
          ) : (
            <>
              {isMobile ? (
                <AtendimentosCompactTable 
                  atendimentos={filteredAtendimentos}
                  onDeleteAtendimento={handleDeleteAtendimento}
                />
              ) : (
                <AtendimentosTable 
                  atendimentos={filteredAtendimentos}
                  onDeleteAtendimento={handleDeleteAtendimento}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
