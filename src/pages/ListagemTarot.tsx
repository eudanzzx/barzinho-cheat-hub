
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
import { Tabs } from "@/components/ui/tabs";

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
    <div className="min-h-screen bg-gradient-to-br from-[#ede9fe] to-[#f9f7fe]">
      <DashboardHeader />
      <main className="container mx-auto px-2 sm:px-6 py-8 sm:py-12">
        {/* Notificações e aniversariante */}
        <div className="mb-6 animate-fade-in">
          <TarotCounterPriorityNotifications analises={analises} />
          {aniversarianteHoje && (
            <div className="animate-scale-in mt-4">
              <ClientBirthdayAlert
                clientName={aniversarianteHoje.nome}
                birthDate={aniversarianteHoje.dataNascimento}
                context="tarot"
              />
            </div>
          )}
        </div>

        {/* Cards de estatísticas */}
        <div className="mb-8">
          <TarotStatsCards
            totalAnalises={analises.length}
            totalRecebido={recebidoStats.total}
            totalRecebidoSemana={recebidoStats.semana}
            totalRecebidoMes={recebidoStats.mes}
            totalRecebidoAno={recebidoStats.ano}
            finalizados={counts.finalizados}
            lembretes={analises.filter((a) => a.lembretes && a.lembretes.length > 0).length}
            selectedPeriod="total"
            onPeriodChange={() => null}
            variant="tarot"
          />
        </div>

        {/* Header igual ao dashboard principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-tarot-primary tracking-tight drop-shadow leading-tight">
              Análises Frequenciais
            </h1>
            <p className="mt-1 text-gray-600 text-sm sm:text-base font-medium">
              Gerencie suas análises frequenciais, utilize os filtros para encontrar rapidamente o que busca.
            </p>
          </div>
          <div className="w-full sm:w-auto flex-shrink-0">
            <TarotSearchInput value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>

        {/* Abas de filtro */}
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

        {/* Card de listagem centralizada igual Dashboard */}
        <section className="flex flex-col items-center justify-center w-full">
          <Card className="w-full max-w-4xl bg-white/80 border border-[#ede9fe] rounded-2xl shadow-2xl hover:shadow-[0_8px_32px_rgb(107,33,168,0.11)] transition-shadow duration-300 animate-fade-in">
            <CardContent className="px-0 sm:px-0 pt-0 pb-2">
              <div className="w-full">
                {tabAnalises.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                    <FileText className="h-12 w-12 text-purple-300 mb-4 animate-pulse" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
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
        </section>
      </main>
    </div>
  );
};

export default ListagemTarot;
