
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, CheckCircle, BellRing } from "lucide-react";

interface TarotStatsCardsProps {
  totalAnalises: number;
  totalRecebido: number;
  totalRecebidoSemana: number;
  totalRecebidoMes: number;
  totalRecebidoAno: number;
  finalizados: number;
  lembretes: number;
  selectedPeriod: "semana" | "mes" | "ano" | "total";
  onPeriodChange: (v: "semana" | "mes" | "ano" | "total") => void;
}

const periodLabels = {
  semana: "Semana",
  mes: "Mês",
  ano: "Ano",
  total: "Total",
};

const TarotStatsCards: React.FC<TarotStatsCardsProps> = ({
  totalAnalises,
  totalRecebido,
  totalRecebidoSemana,
  totalRecebidoMes,
  totalRecebidoAno,
  finalizados,
  lembretes,
  selectedPeriod,
  onPeriodChange,
}) => {
  const getRecebido = () => {
    switch (selectedPeriod) {
      case "semana":
        return totalRecebidoSemana;
      case "mes":
        return totalRecebidoMes;
      case "ano":
        return totalRecebidoAno;
      default:
        return totalRecebido;
    }
  };

  return (
    <div className="mb-8 animate-fade-in">
      {/* Botões de período */}
      <div className="flex gap-2 mb-4">
        {(["semana", "mes", "ano", "total"] as const).map((per) => (
          <button
            key={per}
            type="button"
            aria-pressed={selectedPeriod === per}
            onClick={() => onPeriodChange(per)}
            className={`
              min-w-[94px] max-w-fit px-5 py-2 rounded-xl font-semibold border
              transition-all duration-150 text-sm
              focus:outline-none shadow-md
              border-tarot-primary
              ${
                selectedPeriod === per
                  ? "bg-tarot-primary text-white scale-[1.04] shadow-[0_4px_24px_0_rgba(103,49,147,0.10)] border-tarot-primary"
                  : "bg-white/80 text-tarot-primary hover:bg-[#ede9fe]/80 hover:border-tarot-primary"
              }
            `}
            style={{
              boxShadow:
                selectedPeriod === per
                  ? "0 8px 28px 0 rgba(103,49,147,0.14)"
                  : "0 1.5px 6px 0 rgba(103,49,147,0.07)",
            }}
          >
            {periodLabels[per]}
          </button>
        ))}
      </div>
      {/* Cards com visual igual dashboard, mas cor do tarot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Recebido */}
        <Card className="bg-white/90 border border-tarot-primary shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-semibold text-tarot-primary mb-1 group-hover:text-[#7c3aed] transition-colors duration-300">Recebido</p>
                <p className="text-3xl font-bold text-tarot-primary group-hover:text-[#7c3aed] transition-colors duration-300">
                  R$ {getRecebido().toFixed(2)}
                </p>
              </div>
              <div className="rounded-full p-3 bg-[#ede9fe]/90 group-hover:bg-[#e9d5ff]/80 transition-all duration-200 shadow ring-2 ring-tarot-primary">
                <DollarSign className="h-7 w-7 text-tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Total Análises */}
        <Card className="bg-white/90 border border-tarot-primary shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-semibold text-tarot-primary mb-1 group-hover:text-[#7c3aed] transition-colors duration-300">Total Análises</p>
                <p className="text-3xl font-bold text-tarot-primary group-hover:text-[#7c3aed] transition-colors duration-300">
                  {totalAnalises}
                </p>
              </div>
              <div className="rounded-full p-3 bg-[#ede9fe]/90 group-hover:bg-[#e9d5ff]/80 transition-all duration-200 shadow ring-2 ring-tarot-primary">
                <Users className="h-7 w-7 text-tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Finalizados */}
        <Card className="bg-white/90 border border-tarot-primary shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-semibold text-tarot-primary mb-1 group-hover:text-[#7c3aed] transition-colors duration-300">Finalizados</p>
                <p className="text-3xl font-bold text-tarot-primary group-hover:text-[#7c3aed] transition-colors duration-300">
                  {finalizados}
                </p>
              </div>
              <div className="rounded-full p-3 bg-[#ede9fe]/90 group-hover:bg-[#e9d5ff]/80 transition-all duration-200 shadow ring-2 ring-tarot-primary">
                <CheckCircle className="h-7 w-7 text-tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Lembretes */}
        <Card className="bg-white/90 border border-tarot-primary shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-semibold text-tarot-primary mb-1 group-hover:text-[#7c3aed] transition-colors duration-300">Lembretes</p>
                <p className="text-3xl font-bold text-tarot-primary group-hover:text-[#7c3aed] transition-colors duration-300">
                  {lembretes}
                </p>
              </div>
              <div className="rounded-full p-3 bg-[#ede9fe]/90 group-hover:bg-[#e9d5ff]/80 transition-all duration-200 shadow ring-2 ring-tarot-primary">
                <BellRing className="h-7 w-7 text-tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TarotStatsCards;
