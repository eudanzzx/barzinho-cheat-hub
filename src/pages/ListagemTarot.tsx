
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-[#ede9fe] via-[#f3e8ff] to-[#f8fafc] relative overflow-hidden">
      {/* Fundo animado igual ao dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#c7d2fe]/30 to-[#ede9fe]/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#ddd6fe]/20 to-[#feedfa]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#ede9fe]/10 to-[#f3e8ff]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
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

        <Card className="bg-white/95 backdrop-blur-lg border border-[#ede9fe] shadow-xl rounded-2xl animate-fade-in" style={{ animationDelay: "0.4s" }}>
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
              <TarotSearchInput value={searchTerm} onChange={setSearchTerm} />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TarotTabsFilter
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                total={analises.length}
                finalizados={counts.finalizados}
                emAndamento={counts.emAndamento}
                atencao={counts.atencao}
              />
              <TabsContent value={activeTab} className="space-y-4 animate-fade-in">
                {tabAnalises.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-16 w-16 text-[#bda3f2] mb-4 animate-pulse" />
                    <h3 className="text-xl font-medium text-[#673193]">Nenhuma análise encontrada</h3>
                    <p className="text-[#7c3aed]/80 mt-2">
                      {searchTerm
                        ? "Tente ajustar sua busca ou limpar o filtro"
                        : "Comece criando sua primeira análise frequencial"}
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
