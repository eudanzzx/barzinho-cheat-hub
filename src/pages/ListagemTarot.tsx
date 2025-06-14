
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
      {/* Sombra e layout igual Dashboard */}
      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4">
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

        <Card className="bg-white shadow-sm border border-gray-100 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-tarot-primary">Lista de Análises Frequenciais</h2>
                <span className="text-sm text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                  {analises.length} análises
                </span>
              </div>
              <div className="w-full md:w-auto">
                <TarotSearchInput value={searchTerm} onChange={setSearchTerm} />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TarotTabsFilter
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                total={analises.length}
                finalizados={counts.finalizados}
                emAndamento={counts.emAndamento}
                atencao={counts.atencao}
              />
              <TabsContent value={activeTab} className="space-y-4">
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
                  <TarotAnalysisList
                    analises={tabAnalises}
                    calculateTimeRemaining={() => null}
                    formatTimeRemaining={() => null}
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

export default ListagemTarot;
