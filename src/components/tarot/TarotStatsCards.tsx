
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
const bgCard = "bg-[#f3e8ff]";
const borderCard = "border-[#bda3f2]";

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
      {/* Botões de período redesenhados no mesmo estilo (tabs) do dashboard */}
      <div className="flex w-full md:w-fit items-center mb-4 rounded-lg bg-white/80 border border-[#ede9fe] overflow-x-auto">
        {(["semana", "mes", "ano", "total"] as const).map((per, idx) => (
          <button
            key={per}
            type="button"
            aria-pressed={selectedPeriod === per}
            onClick={() => onPeriodChange(per)}
            className={`
              min-w-[88px] w-full md:w-auto 
              py-2 px-3 text-sm 
              font-medium 
              transition-all duration-150
              border-0 outline-none
              bg-transparent
              ${selectedPeriod === per 
                ? "bg-[#673193] text-white font-semibold shadow-sm"
                : "text-[#673193] hover:bg-[#ede9fe] hover:text-[#573282]"}
              ${idx === 0 ? "rounded-l-lg" : ""}
              ${idx === 3 ? "rounded-r-lg" : ""}
            `}
            style={{
              borderRight: idx !== 3 ? "1px solid #ede9fe" : "none", // Divider para os interiores
            }}
          >
            {periodLabels[per]}
          </button>
        ))}
      </div>

      {/* Cards */}
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
