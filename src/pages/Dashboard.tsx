import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useUserDataService from "@/services/userDataService";
import { Search, FileText, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { deleteAtendimento } from "@/utils/dataServices";
import AtendimentosCompactTable from "@/components/dashboard/AtendimentosCompactTable";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardBirthdayNotifications from "@/components/DashboardBirthdayNotifications";
import MonthlyPaymentControl from "@/components/dashboard/MonthlyPaymentControl";
import WeeklyPaymentControl from "@/components/dashboard/WeeklyPaymentControl";
import AutomaticPaymentNotifications from "@/components/AutomaticPaymentNotifications";

interface AtendimentoData {
  id: string;
  nome: string;
  dataNascimento?: string;
  tipoServico: string;
  statusPagamento: 'pago' | 'pendente' | 'parcelado';
  dataAtendimento: string;
  valor: string;
  planoAtivo?: boolean;
  semanalAtivo?: boolean;
  pacoteAtivo?: boolean;
  pacoteData?: {
    dias: string;
    pacoteDias: Array<{
      id: string;
      data: string;
      valor: string;
    }>;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const userDataService = useUserDataService();
  const { getAtendimentos } = userDataService;
  const [atendimentos, setAtendimentos] = useState<AtendimentoData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'semana' | 'mes' | 'ano' | 'total'>('total');

  useEffect(() => {
    loadAtendimentos();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadAtendimentos();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('atendimentosUpdated', handleStorageChange);
    window.addEventListener('planosUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('atendimentosUpdated', handleStorageChange);
      window.removeEventListener('planosUpdated', handleStorageChange);
    };
  }, []);

  const loadAtendimentos = useCallback(() => {
    console.log('Dashboard - Carregando atendimentos...');
    const data = getAtendimentos();
    console.log('Dashboard - Atendimentos carregados:', data.length);
    setAtendimentos(data);
  }, [getAtendimentos]);

  const handleDeleteAtendimento = useCallback((id: string) => {
    console.log('Dashboard - Deletando atendimento:', id);
    deleteAtendimento(id, userDataService);
    loadAtendimentos();
    window.dispatchEvent(new Event('atendimentosUpdated'));
  }, [userDataService, loadAtendimentos]);

  const filteredAtendimentos = useMemo(() => {
    let filtered = atendimentos.filter(atendimento =>
      atendimento.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const clientesMap = new Map<string, AtendimentoData>();
    
    filtered.forEach(atendimento => {
      const clienteExistente = clientesMap.get(atendimento.nome);
      
      if (!clienteExistente) {
        clientesMap.set(atendimento.nome, atendimento);
      } else {
        const dataAtual = new Date(atendimento.dataAtendimento);
        const dataExistente = new Date(clienteExistente.dataAtendimento);
        
        if (dataAtual > dataExistente) {
          clientesMap.set(atendimento.nome, atendimento);
        }
      }
    });
    
    return Array.from(clientesMap.values());
  }, [atendimentos, searchTerm]);

  const stats = useMemo(() => {
    const hoje = new Date();
    
    // Total recebido
    const totalRecebido = atendimentos
      .filter(a => a.statusPagamento === 'pago')
      .reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);

    // Recebido na semana
    const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
    const fimSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay() + 6));
    const totalRecebidoSemana = atendimentos
      .filter(a => {
        const dataAtendimento = new Date(a.dataAtendimento);
        return a.statusPagamento === 'pago' && 
               dataAtendimento >= inicioSemana && 
               dataAtendimento <= fimSemana;
      })
      .reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);

    // Recebido no mês
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const totalRecebidoMes = atendimentos
      .filter(a => {
        const dataAtendimento = new Date(a.dataAtendimento);
        return a.statusPagamento === 'pago' && 
               dataAtendimento >= inicioMes && 
               dataAtendimento <= fimMes;
      })
      .reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);

    // Recebido no ano
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    const fimAno = new Date(hoje.getFullYear(), 11, 31);
    const totalRecebidoAno = atendimentos
      .filter(a => {
        const dataAtendimento = new Date(a.dataAtendimento);
        return a.statusPagamento === 'pago' && 
               dataAtendimento >= inicioAno && 
               dataAtendimento <= fimAno;
      })
      .reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);

    const totalClientes = new Set(atendimentos.map(a => a.nome)).size;
    
    // Reset hoje para calcular atendimentos da semana
    hoje.setHours(0, 0, 0, 0);
    const novoInicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
    const novoFimSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay() + 6));
    
    const atendimentosSemana = atendimentos.filter(a => {
      const dataAtendimento = new Date(a.dataAtendimento);
      return dataAtendimento >= novoInicioSemana && dataAtendimento <= novoFimSemana;
    }).length;

    return {
      totalRecebido,
      totalRecebidoSemana,
      totalRecebidoMes,
      totalRecebidoAno,
      totalClientes,
      atendimentosSemana
    };
  }, [atendimentos]);

  console.log('Dashboard - Renderizando com:', {
    atendimentos: atendimentos.length,
    filteredAtendimentos: filteredAtendimentos.length,
    searchTerm,
    stats
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <AutomaticPaymentNotifications />
      
      <main className="pt-20 px-4 pb-8">
        <div className="container mx-auto max-w-7xl">
          <DashboardBirthdayNotifications />

          {/* Stats Section */}
          <DashboardStats 
            totalAtendimentos={stats.totalClientes}
            atendimentosSemana={stats.atendimentosSemana}
            totalRecebido={stats.totalRecebido}
            totalRecebidoSemana={stats.totalRecebidoSemana}
            totalRecebidoMes={stats.totalRecebidoMes}
            totalRecebidoAno={stats.totalRecebidoAno}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          {/* Controles de Pagamento */}
          <div className="mb-8 space-y-6">
            <MonthlyPaymentControl />
            <WeeklyPaymentControl />
          </div>

          {/* Lista de Atendimentos */}
          <Card className="bg-white shadow-sm border border-gray-100 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-main-primary">Lista de Atendimentos</h2>
                  <span className="text-sm text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                    {atendimentos.length} atendimentos
                  </span>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Buscar cliente..." 
                    className="pl-10 w-72 rounded-lg border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {filteredAtendimentos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum atendimento encontrado</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    {searchTerm 
                      ? "Tente ajustar sua busca ou criar um novo atendimento" 
                      : "Nenhum atendimento foi registrado ainda. Comece criando seu primeiro atendimento."
                    }
                  </p>
                  <Button 
                    onClick={() => navigate('/novo-atendimento')}
                    className="bg-main-primary hover:bg-main-primary-light text-white rounded-lg px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Atendimento
                  </Button>
                </div>
              ) : (
                <AtendimentosCompactTable 
                  atendimentos={filteredAtendimentos}
                  onDeleteAtendimento={handleDeleteAtendimento}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default React.memo(Dashboard);
