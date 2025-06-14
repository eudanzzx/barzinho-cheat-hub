
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

const mainColor = "#673193";
const bgCard = "bg-[#f3e8ff]";
const borderCard = "border-[#bda3f2]";

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
              borderRight: idx !== 3 ? "1px solid #ede9fe" : "none",
            }}
          >
            {periodLabels[per]}
          </button>
        ))}
      </div>

      {/* Cards no estilo mais compacto do Dashboard, só trocando cores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Recebido */}
        <Card className={`border ${borderCard} rounded-2xl ${bgCard} shadow-sm transition-all duration-200`}>
          <CardContent className="p-4 flex flex-row items-center justify-between min-h-[88px]">
            <div>
              <div className="text-sm font-medium text-[#6B21A8] mb-1">Recebido</div>
              <div className="text-xl md:text-2xl font-bold text-[#673193]">
                R$ {getRecebido().toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl p-2 bg-[#ede9fe]/70">
              <DollarSign className="w-6 h-6 md:w-7 md:h-7 text-[#673193]" />
            </div>
          </CardContent>
        </Card>
        {/* Total Análises */}
        <Card className={`border ${borderCard} rounded-2xl ${bgCard} shadow-sm transition-all duration-200`}>
          <CardContent className="p-4 flex flex-row items-center justify-between min-h-[88px]">
            <div>
              <div className="text-sm font-medium text-[#6B21A8] mb-1">Total Análises</div>
              <div className="text-xl md:text-2xl font-bold text-[#673193]">{totalAnalises}</div>
            </div>
            <div className="rounded-xl p-2 bg-[#ede9fe]/70">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-[#673193]" />
            </div>
          </CardContent>
        </Card>
        {/* Finalizados */}
        <Card className={`border ${borderCard} rounded-2xl ${bgCard} shadow-sm transition-all duration-200`}>
          <CardContent className="p-4 flex flex-row items-center justify-between min-h-[88px]">
            <div>
              <div className="text-sm font-medium text-[#6B21A8] mb-1">Finalizados</div>
              <div className="text-xl md:text-2xl font-bold text-[#673193]">{finalizados}</div>
            </div>
            <div className="rounded-xl p-2 bg-[#ede9fe]/70">
              <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-[#673193]" />
            </div>
          </CardContent>
        </Card>
        {/* Lembretes */}
        <Card className={`border ${borderCard} rounded-2xl ${bgCard} shadow-sm transition-all duration-200`}>
          <CardContent className="p-4 flex flex-row items-center justify-between min-h-[88px]">
            <div>
              <div className="text-sm font-medium text-[#6B21A8] mb-1">Lembretes</div>
              <div className="text-xl md:text-2xl font-bold text-[#673193]">{lembretes}</div>
            </div>
            <div className="rounded-xl p-2 bg-[#ede9fe]/70">
              <BellRing className="w-6 h-6 md:w-7 md:h-7 text-[#673193]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TarotStatsCards;
