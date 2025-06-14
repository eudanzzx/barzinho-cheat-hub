
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import TarotStatsCards from "@/components/tarot/TarotStatsCards";
import TarotAnalysisList from "@/components/tarot/TarotAnalysisList";
import TarotCounterPriorityNotifications from "@/components/TarotCounterPriorityNotifications";
import TarotSearchInput from "@/components/tarot/TarotSearchInput";
import TarotTabsFilter from "@/components/tarot/TarotTabsFilter";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTarotAnalises } from "@/hooks/useTarotAnalises";
import { Tabs } from "@/components/ui/tabs"; // Import Tabs

const ListagemTarot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    analises,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    tabAnalises,
    aniversarianteHoje,
    recebidoStats,
    getStatusCounts,
    handleDelete,
    handleToggleFinished,
  } = useTarotAnalises();

  const counts = getStatusCounts();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4">
        {/* Alerta de prioridade e aniversariante */}
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

        {/* Cards de estatísticas */}
        <TarotStatsCards
          totalAnalises={analises.length}
          totalRecebido={recebidoStats.total}
          totalRecebidoSemana={recebidoStats.semana}
          totalRecebidoMes={recebidoStats.mes}
          totalRecebidoAno={recebidoStats.ano}
          finalizados={counts.finalizados}
          lembretes={analises.filter((a) => a.lembretes && a.lembretes.length > 0).length}
          selectedPeriod={"total"}
          onPeriodChange={() => null}
          variant="tarot"
        />

        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#6B21A8]">
                Lista de Análises Frequenciais
              </h1>
              <p className="text-gray-600 mt-1 text-sm hidden sm:block">
                Gerencie suas análises frequenciais, utilize os filtros para encontrar rapidamente o que busca.
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <TarotSearchInput value={searchTerm} onChange={setSearchTerm} />
            </div>
          </div>

          {/* Corrigido: Tabs envolvendo o filtro */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TarotTabsFilter
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              total={analises.length}
              finalizados={counts.finalizados}
              emAndamento={counts.emAndamento}
              atencao={counts.atencao}
            />
          </Tabs>

          {/* Card de listagem com sombra e animação igual Dashboard */}
          <Card className="bg-white/90 border border-gray-100 rounded-xl shadow-lg transition-shadow duration-200 animate-fade-in">
            <CardContent className="px-0 sm:px-0 pt-0 pb-2">
              <div className="w-full">
                {tabAnalises.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="h-12 w-12 text-purple-300 mb-4 animate-pulse" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Nenhuma análise encontrada
                    </h3>
                    <p className="text-gray-500 text-center">
                      {searchTerm
                        ? "Não há análises que correspondam à sua busca."
                        : "Não há análises frequenciais registradas ainda."}
                    </p>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <TarotAnalysisList
                      analises={tabAnalises}
                      calculateTimeRemaining={() => null}
                      formatTimeRemaining={() => null}
                      onToggleFinished={handleToggleFinished}
                      onEdit={(id) => navigate(`/editar-analise-frequencial/${id}`)}
                      onDelete={handleDelete}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ListagemTarot;

