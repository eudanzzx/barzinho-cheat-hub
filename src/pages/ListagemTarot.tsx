import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Search } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import TarotStatsCards from "@/components/tarot/TarotStatsCards";
import TarotAnalysisList from "@/components/tarot/TarotAnalysisList";
import TarotCounterPriorityNotifications from "@/components/TarotCounterPriorityNotifications";
import TarotSearchInput from "@/components/tarot/TarotSearchInput";
import TarotTabsFilter from "@/components/tarot/TarotTabsFilter";
import { Input } from "@/components/ui/input";
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
    selectedPeriod,
    handlePeriodChange,
    aniversarianteHoje,
    recebidoStats,
    getStatusCounts,
    handleDelete,
    handleToggleFinished,
  } = useTarotAnalises();

  const counts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <DashboardHeader />

      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4">
        {aniversarianteHoje && (
          <ClientBirthdayAlert
            clientName={aniversarianteHoje.nome}
            birthDate={aniversarianteHoje.dataNascimento}
            context="tarot"
          />
        )}

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Análises Frequenciais
              </h1>
              <p className="text-slate-600 mt-1">
                Gerencie suas análises frequenciais e acompanhe estatísticas
              </p>
            </div>
          </div>

          <TarotStatsCards
            totalAnalises={analises.length}
            totalRecebido={recebidoStats.total}
            totalRecebidoSemana={recebidoStats.semana}
            totalRecebidoMes={recebidoStats.mes}
            totalRecebidoAno={recebidoStats.ano}
            finalizados={counts.finalizados}
            lembretes={analises.filter((a) => a.lembretes && a.lembretes.length > 0).length}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            variant="tarot"
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg"
              />
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

          {tabAnalises.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Nenhuma análise encontrada
                </h3>
                <p className="text-gray-500 text-center">
                  {searchTerm
                    ? "Não há análises que correspondam à sua busca."
                    : "Não há análises frequenciais registradas para este período."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {tabAnalises.map((analise) => (
                    <div key={analise.id} className="px-5 pt-4 pb-2">
                      {/* EXIBE OS LEMBRETES caso existam */}
                      {Array.isArray(analise.lembretes) && analise.lembretes.length > 0 && (
                        <div className="mb-2">
                          <div className="font-semibold text-[#A067DF] text-sm mb-1">
                            Contadores do Tratamento:
                          </div>
                          <ul className="list-disc ml-5 space-y-0.5">
                            {analise.lembretes.map((l: any) => (
                              <li key={l.id} className="text-xs text-gray-700">
                                <span className="font-medium">{l.texto || "Sem descrição"}</span>
                                <span className="ml-2 text-gray-400">
                                  ({l.dias} dia{l.dias > 1 ? "s" : ""})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* CARD ORIGINAL (com todos os controles) */}
                      <TarotAnalysisList
                        analises={[analise]}
                        calculateTimeRemaining={() => null}
                        formatTimeRemaining={() => null}
                        onToggleFinished={handleToggleFinished}
                        onEdit={(id) => navigate(`/editar-analise-frequencial/${id}`)}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListagemTarot;
