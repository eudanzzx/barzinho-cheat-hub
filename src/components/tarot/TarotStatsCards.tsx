
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
  variant?: "main" | "tarot";
}

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
  variant = "tarot", // Changed default to tarot
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
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Recebido */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow duration-300 group">
          <CardContent className="p-3 flex flex-col space-y-2 min-h-[78px] items-start justify-between">
            <div className="w-full flex flex-row items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">Recebido</div>
                <div className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-[#6B21A8] transition-colors duration-300">
                  R$ {getRecebido().toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl p-1.5 bg-[#6B21A8]/10 group-hover:bg-[#6B21A8]/20 transition-colors duration-300">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-[#6B21A8]" />
              </div>
            </div>
            {/* Dropdown de período with tarot styling */}
            <div className="w-full mt-1">
              <PeriodDropdown
                selectedPeriod={selectedPeriod}
                onPeriodChange={onPeriodChange}
                variant="tarot"
              />
            </div>
          </CardContent>
        </Card>
        {/* Total Análises */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow duration-300 group">
          <CardContent className="p-3 flex flex-row items-center justify-between min-h-[78px]">
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">Total Análises</div>
              <div className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-[#6B21A8] transition-colors duration-300">{totalAnalises}</div>
            </div>
            <div className="rounded-xl p-1.5 bg-[#6B21A8]/10 group-hover:bg-[#6B21A8]/20 transition-colors duration-300">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-[#6B21A8]" />
            </div>
          </CardContent>
        </Card>
        {/* Finalizados */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow duration-300 group">
          <CardContent className="p-3 flex flex-row items-center justify-between min-h-[78px]">
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">Finalizados</div>
              <div className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-[#6B21A8] transition-colors duration-300">{finalizados}</div>
            </div>
            <div className="rounded-xl p-1.5 bg-[#6B21A8]/10 group-hover:bg-[#6B21A8]/20 transition-colors duration-300">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-[#6B21A8]" />
            </div>
          </CardContent>
        </Card>
        {/* Lembretes */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow duration-300 group">
          <CardContent className="p-3 flex flex-row items-center justify-between min-h-[78px]">
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-300">Lembretes</div>
              <div className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-[#6B21A8] transition-colors duration-300">{lembretes}</div>
            </div>
            <div className="rounded-xl p-1.5 bg-[#6B21A8]/10 group-hover:bg-[#6B21A8]/20 transition-colors duration-300">
              <BellRing className="w-5 h-5 md:w-6 md:h-6 text-[#6B21A8]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TarotStatsCards;
