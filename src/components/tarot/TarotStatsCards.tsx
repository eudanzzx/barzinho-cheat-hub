
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, CheckCircle, BellRing } from "lucide-react";
import PeriodDropdown from "@/components/dashboard/PeriodDropdown";

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
      {/* Dropdown de período centralizado */}
      <div className="flex justify-center mb-4">
        <PeriodDropdown selectedPeriod={selectedPeriod} onPeriodChange={onPeriodChange} />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Recebido */}
        <Card className={`border ${borderCard} rounded-2xl ${bgCard} shadow-sm transition-all duration-200`}>
          <CardContent className="p-3 flex flex-row items-center justify-between min-h-[78px]">
            <div>
              <div className="text-xs font-medium text-[#6B21A8] mb-1">Recebido</div>
              <div className="text-lg md:text-xl font-bold text-[#673193]">
                R$ {getRecebido().toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl p-1.5 bg-[#ede9fe]/70">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-[#673193]" />
            </div>
          </CardContent>
        </Card>
        {/* Total Análises */}
        <Card className={`border ${borderCard} rounded-2xl ${bgCard} shadow-sm transition-all duration-200`}>
          <CardContent className="p-3 flex flex-row items-center justify-between min-h-[78px]">
            <div>
              <div className="text-xs font-medium text-[#6B21A8] mb-1">Total Análises</div>
              <div className="text-lg md:text-xl font-bold text-[#673193]">{totalAnalises}</div>
            </div>
            <div className="rounded-xl p-1.5 bg-[#ede9fe]/70">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-[#673193]" />
            </div>
          </CardContent>
        </Card>
        {/* Finalizados */}
        <Card className={`border ${borderCard} rounded-2xl ${bgCard} shadow-sm transition-all duration-200`}>
          <CardContent className="p-3 flex flex-row items-center justify-between min-h-[78px]">
            <div>
              <div className="text-xs font-medium text-[#6B21A8] mb-1">Finalizados</div>
              <div className="text-lg md:text-xl font-bold text-[#673193]">{finalizados}</div>
            </div>
            <div className="rounded-xl p-1.5 bg-[#ede9fe]/70">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-[#673193]" />
            </div>
          </CardContent>
        </Card>
        {/* Lembretes */}
        <Card className={`border ${borderCard} rounded-2xl ${bgCard} shadow-sm transition-all duration-200`}>
          <CardContent className="p-3 flex flex-row items-center justify-between min-h-[78px]">
            <div>
              <div className="text-xs font-medium text-[#6B21A8] mb-1">Lembretes</div>
              <div className="text-lg md:text-xl font-bold text-[#673193]">{lembretes}</div>
            </div>
            <div className="rounded-xl p-1.5 bg-[#ede9fe]/70">
              <BellRing className="w-5 h-5 md:w-6 md:h-6 text-[#673193]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TarotStatsCards;
