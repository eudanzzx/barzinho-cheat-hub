
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// Layout visual inspirado na home.
// Não possui botões, animações ou menus interativos.
const tarotStats = [
  { label: "Total de Análises", value: "28" },
  { label: "Análises Finalizadas", value: "17" },
  { label: "Em Andamento", value: "8" },
  { label: "Atendimento Em Atenção", value: "3" },
  { label: "Recebido no Mês", value: "R$ 2.510,00" },
];

const ListagemTarot = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f3fa] to-[#ede9fe] flex flex-col">
      <header className="w-full border-b border-[#ede9fe] bg-white/90 py-7 shadow-sm mb-4">
        <div className="container mx-auto max-w-6xl px-5">
          <h1 className="text-3xl md:text-4xl font-bold text-tarot-primary leading-tight tracking-tight">
            Análises Frequenciais
          </h1>
          <p className="mt-2 text-[1.12rem] text-gray-600 font-medium max-w-xl">
            Visualize e acompanhe suas análises frequenciais do Tarot com praticidade. O painel abaixo mostra as estatísticas consolidadas de sua atuação.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="container mx-auto max-w-6xl px-5">
          {/* Cards informativos, layout idêntico ao painel principal */}
          <section className="mb-12 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tarotStats.map((stat, idx) => (
                <Card
                  key={stat.label}
                  className={`
                    shadow-md border border-[#e3dafc]
                    ${idx === 0
                      ? "bg-tarot-primary text-white"
                      : "bg-white/90 text-[#41226e]"}
                    flex flex-col justify-center relative
                    min-h-[120px]
                    `}
                >
                  <CardContent className="p-6">
                    <div className={`text-xs mb-2 font-semibold tracking-wide ${idx === 0 ? "text-white/70" : "text-tarot-primary"}`}>
                      {stat.label}
                    </div>
                    <div className={`text-3xl md:text-4xl font-bold ${idx === 0 ? "text-white drop-shadow" : "text-tarot-primary"}`}>
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Espaço visual abaixo dos cards */}
          <section className="bg-white/90 border border-[#efe5fe] rounded-2xl shadow-sm px-6 py-12 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-tarot-primary mb-4">
              Nenhuma análise encontrada
            </h2>
            <p className="text-lg text-gray-500">
              Por enquanto, você ainda não cadastrou análises frequenciais. Todas as análises cadastradas aparecerão aqui.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ListagemTarot;
