
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
      {/* Estilo fiel aos botões da dashboard, mas destaque tarot */}
      <div className="flex gap-2 mb-4">
        {(["semana", "mes", "ano", "total"] as const).map((per) => (
          <button
            key={per}
            type="button"
            aria-pressed={selectedPeriod === per}
            onClick={() => onPeriodChange(per)}
            className={`
              min-w-[94px] max-w-fit px-5 py-2 rounded-lg font-semibold border
              transition-all duration-150 text-sm
              shadow-sm focus:ring-2 focus:ring-tarot-primary/50 focus:outline-none
              ${
                selectedPeriod === per
                  ? "bg-tarot-primary text-white border-tarot-primary shadow-[0_1px_8px_0_rgba(103,49,147,0.13)] scale-[1.03]"
                  : "bg-white text-tarot-primary border-[#ede9fe] hover:bg-[#ede9fe]/60 hover:border-tarot-primary"
              }
            `}
            style={{
              boxShadow:
                selectedPeriod === per
                  ? "0 4px 20px 0 rgba(103,49,147,0.10)"
                  : "0 1px 3px 0 rgba(103,49,147,0.06)",
            }}
          >
            {periodLabels[per]}
          </button>
        ))}
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/95 border border-[#ede9fe] shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-medium text-tarot-primary mb-1">Recebido</p>
                <p className="text-2xl font-bold text-tarot-primary">
                  R$ {getRecebido().toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl p-2 bg-[#ede9fe]">
                <DollarSign className="h-7 w-7 text-tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/95 border border-[#ede9fe] shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-medium text-tarot-primary mb-1">Total Análises</p>
                <p className="text-2xl font-bold text-tarot-primary">{totalAnalises}</p>
              </div>
              <div className="rounded-xl p-2 bg-[#ede9fe]">
                <Users className="h-7 w-7 text-tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/95 border border-[#ede9fe] shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-medium text-tarot-primary mb-1">Finalizados</p>
                <p className="text-2xl font-bold text-tarot-primary">{finalizados}</p>
              </div>
              <div className="rounded-xl p-2 bg-[#ede9fe]">
                <CheckCircle className="h-7 w-7 text-tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/95 border border-[#ede9fe] shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-medium text-tarot-primary mb-1">Lembretes</p>
                <p className="text-2xl font-bold text-tarot-primary">{lembretes}</p>
              </div>
              <div className="rounded-xl p-2 bg-[#ede9fe]">
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

