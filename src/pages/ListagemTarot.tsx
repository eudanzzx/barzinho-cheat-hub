
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";

const tarotStats = [
  {
    label: "Total de Análises",
    value: 48,
    color: "text-purple-700",
    bg: "bg-purple-100"
  },
  {
    label: "Finalizadas",
    value: 33,
    color: "text-purple-700",
    bg: "bg-purple-100"
  },
  {
    label: "Recebido (Mês)",
    value: "R$ 3.250,00",
    color: "text-purple-700",
    bg: "bg-purple-100"
  }
];

const TarotListagemEstatica = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ede9fe] to-[#f9f7fe]">
      <DashboardHeader />

      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4">
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-tarot-primary tracking-tight drop-shadow">
            Dashboard Tarot
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base font-medium">
            Acompanhe suas análises frequenciais e resultados do Tarot com clareza.
          </p>
        </div>

        {/* Cards informativos (linha) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {tarotStats.map((stat, i) => (
            <Card
              key={i}
              className={`rounded-2xl shadow-md border border-[#ede9fe] ${stat.bg}`}
            >
              <CardContent className="py-8 flex flex-col items-center">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="mt-2 text-gray-700 font-medium text-base">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Card grande central da listagem (estático) */}
        <div className="flex flex-col items-center w-full">
          <Card className="w-full max-w-4xl bg-white/80 border border-[#ede9fe] rounded-2xl shadow-2xl">
            <CardContent className="py-16 flex flex-col items-center justify-center">
              <div className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">
                Nenhuma análise frequencial para exibir!
              </div>
              <div className="text-gray-500 text-center text-base">
                No momento não há análises nesta seção. 
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
};

export default TarotListagemEstatica;
