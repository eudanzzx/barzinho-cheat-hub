
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Download, Users, Activity, Sparkles, TrendingUp } from "lucide-react";
import useUserDataService from "@/services/userDataService";
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ReportManager from "@/components/ReportManager";
import TarotPlanoNotifications from "@/components/TarotPlanoNotifications";

const RelatorioGeralTarot = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  const [analises] = useState(getAllTarotAnalyses());

  const calcularEstatisticas = () => {
    const hoje = new Date();
    const receitaTotal = analises.reduce((sum, analise) => sum + parseFloat(analise.preco || "0"), 0);
    
    const receitaMesAtual = analises
      .filter(analise => {
        const data = new Date(analise.dataInicio);
        return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
      })
      .reduce((sum, analise) => sum + parseFloat(analise.preco || "0"), 0);

    const analisesFinalizadas = analises.filter(a => a.finalizado === true).length;
    const analisesPendentes = analises.filter(a => a.finalizado !== true).length;
    const ticketMedio = receitaTotal / analises.length || 0;

    return {
      receitaTotal,
      receitaMesAtual,
      analisesFinalizadas,
      analisesPendentes,
      ticketMedio,
      totalAnalises: analises.length
    };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-violet-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <DashboardHeader />
      
      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4 max-w-7xl relative z-10">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="transform hover:scale-110 transition-all duration-300 hover:rotate-12">
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-tarot-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-tarot-primary bg-gradient-to-r from-tarot-primary to-purple-600 bg-clip-text text-transparent">
                Relatórios Gerais - Tarot
              </h1>
              <p className="text-tarot-primary mt-1 opacity-80 text-sm sm:text-base">Visão geral das análises de tarot frequencial</p>
            </div>
          </div>
        </div>

        {/* Tarot Plan Notifications */}
        <TarotPlanoNotifications />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard 
            title="Total de Análises" 
            value={stats.totalAnalises.toString()} 
            icon={<Users className="h-6 w-6 sm:h-8 sm:w-8 text-tarot-primary" />} 
          />
          <StatCard 
            title="Análises Finalizadas" 
            value={stats.analisesFinalizadas.toString()}
            icon={<Activity className="h-6 w-6 sm:h-8 sm:w-8 text-tarot-primary" />} 
          />
          <StatCard 
            title="Análises Pendentes"
            value={stats.analisesPendentes.toString()} 
            icon={<Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-tarot-primary" />} 
          />
          <StatCard 
            title="Receita Total" 
            value={`R$ ${stats.receitaTotal.toFixed(2)}`} 
            icon={<TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-tarot-primary" />} 
          />
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-tarot-primary text-lg sm:text-xl">Opções de Relatórios</CardTitle>
            <CardDescription className="text-sm sm:text-base">Gere relatórios detalhados dos dados do tarot</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ReportManager variant="tarot" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 group hover:bg-white hover:-translate-y-2 hover:scale-105">
    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
      <div className="flex justify-between items-center">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">{title}</p>
          <p className="text-lg sm:text-3xl font-bold text-slate-800 group-hover:text-tarot-primary transition-colors duration-300 truncate">{value}</p>
        </div>
        <div className="rounded-xl p-2 sm:p-3 bg-tarot-primary/10 group-hover:bg-tarot-primary/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 flex-shrink-0">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RelatorioGeralTarot;
