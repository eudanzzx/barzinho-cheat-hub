import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useUserDataService from "@/services/userDataService";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AtendimentosTable from "@/components/dashboard/AtendimentosTable";
import AtendimentosCompactTable from "@/components/dashboard/AtendimentosCompactTable";
import DashboardStats from "@/components/dashboard/DashboardStats";
import PeriodDropdown from "@/components/dashboard/PeriodDropdown";
import AutomaticPaymentNotifications from "@/components/AutomaticPaymentNotifications";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  AlertTriangle 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const Index: React.FC = () => {
  const { getAtendimentos, checkClientBirthday, saveAtendimentos } = useUserDataService();
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [filteredAtendimentos, setFilteredAtendimentos] = useState<any[]>([]);
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState<'semana' | 'mes' | 'ano' | 'total'>('mes');
  const [searchTerm, setSearchTerm] = useState('');
  const [aniversarianteHoje, setAniversarianteHoje] = useState<{ nome: string; dataNascimento: string } | null>(null);
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
    loadAtendimentos();
  }, [loadAtendimentos]);

  useEffect(() => {
    filterAtendimentos(atendimentos, periodoVisualizacao, searchTerm);
  }, [atendimentos, periodoVisualizacao, searchTerm]);

  useEffect(() => {
    const handleDataUpdated = () => {
      loadAtendimentos();
    };

    window.addEventListener('atendimentosUpdated', handleDataUpdated);
    window.addEventListener('planosUpdated', handleDataUpdated);

    return () => {
      window.removeEventListener('atendimentosUpdated', handleDataUpdated);
      window.removeEventListener('planosUpdated', handleDataUpdated);
    };
  }, [loadAtendimentos]);

  const calculateStats = useMemo(() => {
    const totalAtendimentos = filteredAtendimentos.length;
    const now = new Date();

    // Corrigir início e fim da semana (segunda a domingo)
    const dayOfWeek = now.getDay();
    // Ajusta início da semana para segunda-feira (0 = domingo, 1 = segunda, ...)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Início/fim do mês
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Início/fim do ano
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31);

    // Função auxiliar para pegar apenas pagamentos "pago" dentro de um período
    const somaPorPeriodo = (inicio: Date, fim: Date) => (
      atendimentos
        .filter(a => {
          if (a.statusPagamento !== 'pago') return false;
          const date = new Date(a.dataAtendimento);
          // Inclui datas dentro do intervalo (inclusive)
          return date >= inicio && date <= fim;
        })
        .reduce((sum, a) => sum + parseFloat(a.valor || '0'), 0)
    );

    const totalRecebido = atendimentos
      .filter(a => a.statusPagamento === 'pago')
      .reduce((sum, a) => sum + parseFloat(a.valor || '0'), 0);

    const totalRecebidoSemana = somaPorPeriodo(weekStart, weekEnd);
    const totalRecebidoMes = somaPorPeriodo(monthStart, monthEnd);
    const totalRecebidoAno = somaPorPeriodo(yearStart, yearEnd);

    const atendimentosSemana = atendimentos.filter(a => {
      const date = new Date(a.dataAtendimento);
      return date >= weekStart && date <= weekEnd;
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <AutomaticPaymentNotifications />

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
          </div>

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
            {/* Espaço vazio antes do campo de busca */}
            <div />
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
