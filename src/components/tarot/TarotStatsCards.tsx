
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

// Cores principais do tarot (roxo)
const mainColor = "#673193";
const bgCard = "bg-[#f3e8ff]"; // roxo claro, mantendo leveza semelhante ao azul claro
const borderCard = "border-[#bda3f2]"; // roxo bem suave

const iconColor = mainColor;

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
              min-w-[94px] max-w-fit px-5 py-2 rounded-lg font-semibold border
              bg-[#f3e8ff] border-[#bda3f2] text-[#673193] shadow-sm
              transition-all duration-150 text-sm
              focus:outline-none 
              ${selectedPeriod === per
                ? "ring-2 ring-[#a21caf] font-bold bg-[#ede9fe] scale-[1.05]"
                : "hover:bg-[#ede9fe]/80 hover:border-[#a21caf]"}
            `}
          >
            {periodLabels[per]}
          </button>
        ))}
      </div>

      {/* Cards no estilo da sua referência, só que usando tons de roxo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Recebido */}
        <Card className={`rounded-xl ${bgCard} border ${borderCard} shadow-sm`}>
          <CardContent className="py-5 px-6 flex flex-row items-center justify-between">
            <div>
              <div className="text-sm text-[#673193] mb-1">Recebido</div>
              <div className="text-[1.5rem] font-bold text-[#673193]">
                R$ {getRecebido().toFixed(2)}
              </div>
            </div>
            <DollarSign className="w-7 h-7 text-[#673193]" />
          </CardContent>
        </Card>
        {/* Total Análises */}
        <Card className={`rounded-xl ${bgCard} border ${borderCard} shadow-sm`}>
          <CardContent className="py-5 px-6 flex flex-row items-center justify-between">
            <div>
              <div className="text-sm text-[#673193] mb-1">Total Análises</div>
              <div className="text-[1.5rem] font-bold text-[#673193]">{totalAnalises}</div>
            </div>
            <Users className="w-7 h-7 text-[#673193]" />
          </CardContent>
        </Card>
        {/* Finalizados */}
        <Card className={`rounded-xl ${bgCard} border ${borderCard} shadow-sm`}>
          <CardContent className="py-5 px-6 flex flex-row items-center justify-between">
            <div>
              <div className="text-sm text-[#673193] mb-1">Finalizados</div>
              <div className="text-[1.5rem] font-bold text-[#673193]">{finalizados}</div>
            </div>
            <CheckCircle className="w-7 h-7 text-[#673193]" />
          </CardContent>
        </Card>
        {/* Lembretes */}
        <Card className={`rounded-xl ${bgCard} border ${borderCard} shadow-sm`}>
          <CardContent className="py-5 px-6 flex flex-row items-center justify-between">
            <div>
              <div className="text-sm text-[#673193] mb-1">Lembretes</div>
              <div className="text-[1.5rem] font-bold text-[#673193]">{lembretes}</div>
            </div>
            <BellRing className="w-7 h-7 text-[#673193]" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TarotStatsCards;
