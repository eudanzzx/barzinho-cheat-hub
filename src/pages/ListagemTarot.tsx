
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const tarotStats = [
  {
    label: "Total de Análises",
    value: 48,
  },
  {
    label: "Finalizadas",
    value: 33,
  },
  {
    label: "Recebido (Mês)",
    value: "R$ 3.250,00",
  }
];

const ListagemTarot: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ede9fe] to-[#f9f7fe]">
      <DashboardHeader />

      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4">
        {/* Título e subtítulo estão idênticos ao da home */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-tarot-primary tracking-tight drop-shadow">
            Dashboard Tarot
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base font-medium">
            Acompanhe suas análises frequenciais e resultados do Tarot com clareza.
          </p>
        </div>

        {/* Cards informativos em linha, igual home, mas roxos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {tarotStats.map((stat, i) => (
            <Card
              key={i}
              className="rounded-xl shadow-lg border border-[#d1b3ff] bg-white/95"
            >
              <CardContent className="py-7 flex flex-col items-center">
                <span className="text-3xl font-bold text-tarot-primary">{stat.value}</span>
                <span className="mt-2 text-gray-700 font-medium text-base">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Card central igual ao da home, ajustado para o tema estático */}
        <Card className="w-full max-w-4xl mx-auto bg-white/90 border border-[#ede9fe] rounded-xl shadow-xl">
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mb-5" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma análise frequencial para exibir!
            </h3>
            <div className="text-gray-500 text-center text-base">
              No momento não há análises registradas nesta seção.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ListagemTarot;
