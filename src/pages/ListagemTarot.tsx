import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  DollarSign,
  CheckCircle,
  Calendar,
  Edit3,
  Trash2,
  Star,
  AlertTriangle,
  Users,
  Sparkles,
  BellRing,
  Check,
  X,
  Clock
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Logo from "@/components/Logo";
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import TarotCounterPriorityNotifications from "@/components/TarotCounterPriorityNotifications";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PlanoPaymentButton from "@/components/tarot/PlanoPaymentButton";
import SemanalPaymentButton from "@/components/tarot/SemanalPaymentButton";
import TarotStatsCards from "@/components/tarot/TarotStatsCards";
import TarotAnalysisList from "@/components/tarot/TarotAnalysisList";

const ListagemTarot = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [analises, setAnalises] = useState([]);
  const [filteredAnalises, setFilteredAnalises] = useState([]);
  const [activeTab, setActiveTab] = useState("todas");
  const [aniversarianteHoje, setAniversarianteHoje] = useState(null);
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'ano' | 'total'>('total');
  const [recebidoStats, setRecebidoStats] = useState({
    total: 0,
    semana: 0,
    mes: 0,
    ano: 0,
  });
  const { getAllTarotAnalyses, deleteTarotAnalysis, saveAllTarotAnalyses } = useUserDataService();
  const { toast } = useToast();

  useEffect(() => {
    loadAnalises();
  }, []);

  // Reload analyses when returning to this page
  useEffect(() => {
    const handleFocus = () => {
      console.log('ListagemTarot - Página focada, recarregando análises...');
      loadAnalises();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const filtered = analises.filter(analise =>
      analise.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAnalises(filtered);
  }, [searchTerm, analises]);

  useEffect(() => {
    checkBirthdaysToday(analises);
  }, [analises]);

  // Listen for birthday notification removal events
  useEffect(() => {
    const handleBirthdayNotificationRemoved = (event) => {
      const { clientName, analysisType } = event.detail;
      
      if (analysisType === 'tarot' && aniversarianteHoje?.nome === clientName) {
        console.log('ListagemTarot - Removendo notificação de aniversário para:', clientName);
        setAniversarianteHoje(null);
      }
    };

    window.addEventListener('birthdayNotificationRemoved', handleBirthdayNotificationRemoved);
    
    return () => {
      window.removeEventListener('birthdayNotificationRemoved', handleBirthdayNotificationRemoved);
    };
  }, [aniversarianteHoje]);

  const loadAnalises = () => {
    console.log('ListagemTarot - Carregando análises...');
    const data = getAllTarotAnalyses();
    console.log('ListagemTarot - Dados carregados:', data.length, 'análises');
    console.log('ListagemTarot - Primeira análise:', data[0]);
    setAnalises(data);
    setFilteredAnalises(data);
  };

  const checkBirthdaysToday = (analises) => {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    
    const birthdayClient = analises.find(analise => {
      if (!analise.dataNascimento) return false;
      
      try {
        const [year, month, day] = analise.dataNascimento.split('-').map(Number);
        return day === todayDay && month === todayMonth;
      } catch (error) {
        console.error('Error parsing birth date:', error);
        return false;
      }
    });
    
    if (birthdayClient) {
      setAniversarianteHoje({
        nome: birthdayClient.nomeCliente,
        dataNascimento: birthdayClient.dataNascimento
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      deleteTarotAnalysis(id);
      loadAnalises();
      toast({
        title: "Análise removida",
        description: "A análise foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover análise",
        description: "Ocorreu um erro ao tentar remover a análise.",
      });
    }
  };

  const handleToggleFinished = (id) => {
    try {
      const updatedAnalises = analises.map(analise => 
        analise.id === id 
          ? { ...analise, finalizado: !analise.finalizado }
          : analise
      );
      
      saveAllTarotAnalyses(updatedAnalises);
      setAnalises(updatedAnalises);
      setFilteredAnalises(updatedAnalises);
      
      const analise = analises.find(a => a.id === id);
      const newStatus = !analise.finalizado;
      
      // Dispatch event when analysis is finalized to remove counters
      if (newStatus) {
        console.log('ListagemTarot - Disparando evento de finalização para:', id);
        const event = new CustomEvent('tarotAnalysisFinalized', {
          detail: { analysisId: id }
        });
        window.dispatchEvent(event);
      }
      
      toast({
        title: newStatus ? "Análise finalizada" : "Análise reaberta",
        description: newStatus 
          ? "A análise foi marcada como finalizada." 
          : "A análise foi reaberta e marcada como pendente.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar análise",
        description: "Ocorreu um erro ao tentar atualizar o status da análise.",
      });
    }
  };

  const calculateTimeRemaining = (analise) => {
    console.log('ListagemTarot - Calculando tempo restante para:', analise.nomeCliente, 'Lembretes:', analise.lembretes);
    
    if (!analise.lembretes || !Array.isArray(analise.lembretes) || analise.lembretes.length === 0 || !analise.dataInicio) {
      console.log('ListagemTarot - Sem lembretes ou data de início');
      return null;
    }

    const now = new Date();
    let closestExpiration = null;
    let closestDiff = Infinity;

    analise.lembretes.forEach((lembrete) => {
      console.log('ListagemTarot - Processando lembrete:', lembrete);
      
      if (lembrete.texto && lembrete.dias) {
        const dataInicio = new Date(analise.dataInicio);
        const dataExpiracao = new Date(dataInicio);
        dataExpiracao.setDate(dataExpiracao.getDate() + parseInt(lembrete.dias));
        
        const timeDiff = dataExpiracao.getTime() - now.getTime();
        
        console.log('ListagemTarot - Tempo diferença:', timeDiff, 'Data expiração:', dataExpiracao);
        
        if (timeDiff < closestDiff && timeDiff >= 0) {
          closestDiff = timeDiff;
          closestExpiration = {
            days: Math.ceil(timeDiff / (1000 * 3600 * 24)),
            hours: Math.ceil(timeDiff / (1000 * 3600)),
            timeDiff: timeDiff
          };
        }
      }
    });

    console.log('ListagemTarot - Resultado tempo restante:', closestExpiration);
    return closestExpiration;
  };

  const formatTimeRemaining = (timeRemaining) => {
    if (!timeRemaining) return null;
    
    if (timeRemaining.days === 0) {
      return timeRemaining.hours <= 1 ? "< 1h" : `${timeRemaining.hours}h`;
    }
    if (timeRemaining.days === 1) return "1d";
    return `${timeRemaining.days}d`;
  };

  const sortAnalisesByTimeRemaining = (analises) => {
    return [...analises].sort((a, b) => {
      const timeA = calculateTimeRemaining(a);
      const timeB = calculateTimeRemaining(b);
      
      // Análises sem contador vão para o final
      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;
      
      // Ordena por tempo mais próximo primeiro
      return timeA.timeDiff - timeB.timeDiff;
    });
  };

  const getFilteredAnalisesByTab = () => {
    let filtered;
    switch(activeTab) {
      case "finalizadas":
        filtered = filteredAnalises.filter(analise => analise.finalizado);
        break;
      case "pendentes":
        filtered = filteredAnalises.filter(analise => !analise.finalizado);
        break;
      case "atencao":
        filtered = filteredAnalises.filter(analise => analise.atencaoFlag);
        break;
      default:
        filtered = filteredAnalises;
    }
    
    // Ordena por tempo restante
    return sortAnalisesByTimeRemaining(filtered);
  };

  const getTotalValue = () => {
    return analises.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0).toFixed(2);
  };

  const getStatusCounts = () => {
    const finalizados = analises.filter(a => a.finalizado).length;
    const emAndamento = analises.filter(a => !a.finalizado).length;
    const atencao = analises.filter(a => a.atencaoFlag).length;
    return { finalizados, emAndamento, atencao };
  };

  const analisesToShow = useMemo(() => getFilteredAnalisesByTab(), [activeTab, filteredAnalises]);
  const { finalizados, emAndamento, atencao } = useMemo(() => getStatusCounts(), [analises]);

  useEffect(() => {
    calculaStatsRecebido();
  }, [analises]);

  function calculaStatsRecebido() {
    const now = new Date();
    let total = 0, semana = 0, mes = 0, ano = 0;

    analises.forEach(a => {
      const date = new Date(a.dataInicio || a.dataAtendimento);
      const preco = parseFloat(a.preco || "150");
      total += preco;
      if (!isNaN(date.getTime())) {
        // ÚLTIMA SEMANA
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

        // Últimos 7 dias
        if (diffDays <= 7) semana += preco;
        // Este mês
        if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) mes += preco;
        // Este ano
        if (date.getFullYear() === now.getFullYear()) ano += preco;
      }
    });

    setRecebidoStats({
      total,
      semana,
      mes,
      ano,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ede9fe] via-[#f3e8ff] to-[#f8fafc] relative overflow-hidden">
      {/* Fundo animado igual ao dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#c7d2fe]/30 to-[#ede9fe]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#ddd6fe]/20 to-[#feedfa]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#ede9fe]/10 to-[#f3e8ff]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <DashboardHeader />

      <main className="pt-20 p-4 animate-fade-in relative z-10 max-w-6xl mx-auto">
        <TarotCounterPriorityNotifications analises={analises} />
        
        {aniversarianteHoje && (
          <div className="animate-scale-in mb-6">
            <ClientBirthdayAlert 
              clientName={aniversarianteHoje.nome}
              birthDate={aniversarianteHoje.dataNascimento}
              context="tarot"
            />
          </div>
        )}

        {/* NOVOS CARDS DE STATS */}
        <TarotStatsCards
          totalAnalises={analises.length}
          totalRecebido={recebidoStats.total}
          totalRecebidoSemana={recebidoStats.semana}
          totalRecebidoMes={recebidoStats.mes}
          totalRecebidoAno={recebidoStats.ano}
          finalizados={analises.filter(a => a.finalizado).length}
          lembretes={analises.filter(a => a.lembretes && a.lembretes.length > 0).length}
          selectedPeriod={periodo}
          onPeriodChange={setPeriodo}
          variant="tarot"
        />

        <Card className="bg-white/95 backdrop-blur-lg border border-[#ede9fe] shadow-xl rounded-2xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="border-b border-[#ede9fe] pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#673193] to-purple-600 bg-clip-text text-transparent">
                  Análises Frequenciais
                </CardTitle>
                <Badge variant="secondary" className="bg-[#e9d5ff]/30 text-[#673193] border-[#e9d5ff]/30">
                  {analises.length} análises
                </Badge>
              </div>
              <div className="relative group w-full sm:w-auto">
                <Input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="pr-10 bg-white/80 border-[#ede9fe] focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-lg transform hover:scale-105"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#bda3f2] group-hover:text-[#673193] transition-colors duration-300" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/70 border border-[#ede9fe] rounded-xl mb-6">
                <TabsTrigger 
                  value="todas" 
                  className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
                >
                  Todas ({analises.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="finalizadas" 
                  className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
                >
                  Finalizadas ({finalizados})
                </TabsTrigger>
                <TabsTrigger 
                  value="pendentes" 
                  className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
                >
                  Pendentes ({emAndamento})
                </TabsTrigger>
                <TabsTrigger 
                  value="atencao" 
                  className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
                >
                  Atenção ({atencao})
                </TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="space-y-4 animate-fade-in">
                {analisesToShow.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-16 w-16 text-[#bda3f2] mb-4 animate-pulse" />
                    <h3 className="text-xl font-medium text-[#673193]">Nenhuma análise encontrada</h3>
                    <p className="text-[#7c3aed]/80 mt-2">
                      {searchTerm 
                        ? "Tente ajustar sua busca ou limpar o filtro" 
                        : "Comece criando sua primeira análise frequencial"
                      }
                    </p>
                  </div>
                ) : (
                  <TarotAnalysisList
                    analises={analisesToShow}
                    calculateTimeRemaining={calculateTimeRemaining}
                    formatTimeRemaining={formatTimeRemaining}
                    onToggleFinished={handleToggleFinished}
                    onEdit={(id) => navigate(`/editar-analise-frequencial/${id}`)}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, delay = "0s" }) => (
  <Card className="bg-white/95 backdrop-blur-lg border border-[#ede9fe] shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 group hover:bg-white hover:-translate-y-2 hover:scale-105 animate-fade-in" style={{ animationDelay: delay }}>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-[#6B21A8] mb-1 group-hover:text-[#7c3aed] transition-colors duration-300">{title}</p>
          <p className="text-3xl font-bold text-[#673193] group-hover:text-[#7c3aed] transition-colors duration-300">{value}</p>
        </div>
        <div className="rounded-xl p-3 bg-[#ede9fe]/70 group-hover:bg-[#e9d5ff]/70 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ListagemTarot;
