
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
  selectedPeriod: 'semana' | 'mes' | 'ano' | 'total';
  onPeriodChange: (v: 'semana' | 'mes' | 'ano' | 'total') => void;
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
}) => {
  const getRecebido = () => {
    switch (selectedPeriod) {
      case 'semana': return totalRecebidoSemana;
      case 'mes': return totalRecebidoMes;
      case 'ano': return totalRecebidoAno;
      default: return totalRecebido;
    }
  };

  return (
    <div className="mb-8 animate-fade-in">
      {/* Period Selector */}
      <div className="flex gap-2 mb-3">
        {(['semana', 'mes', 'ano', 'total'] as const).map((per) => (
          <button
            key={per}
            className={`px-3 py-1 rounded-md text-sm font-semibold border transition-all duration-200
              ${selectedPeriod === per
                ? "bg-[#673193] text-white border-[#673193]"
                : "bg-white text-[#673193] border-[#ede9fe] hover:bg-[#ede9fe]"
              }`}
            onClick={() => onPeriodChange(per)}
            type="button"
          >
            {per === "semana" ? "Semana" : per === "mes" ? "Mês" : per === "ano" ? "Ano" : "Total"}
          </button>
        ))}
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/95 border border-[#ede9fe] shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-medium text-[#673193] mb-1">Recebido</p>
                <p className="text-2xl font-bold text-[#673193]">R$ {getRecebido().toFixed(2)}</p>
              </div>
              <div className="rounded-xl p-2 bg-[#ede9fe]">
                <DollarSign className="h-7 w-7 text-[#673193]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/95 border border-[#ede9fe] shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-medium text-[#673193] mb-1">Total Análises</p>
                <p className="text-2xl font-bold text-[#673193]">{totalAnalises}</p>
              </div>
              <div className="rounded-xl p-2 bg-[#ede9fe]">
                <Users className="h-7 w-7 text-[#673193]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/95 border border-[#ede9fe] shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-medium text-[#673193] mb-1">Finalizados</p>
                <p className="text-2xl font-bold text-[#673193]">{finalizados}</p>
              </div>
              <div className="rounded-xl p-2 bg-[#ede9fe]">
                <CheckCircle className="h-7 w-7 text-[#673193]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/95 border border-[#ede9fe] shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-medium text-[#673193] mb-1">Lembretes</p>
                <p className="text-2xl font-bold text-[#673193]">{lembretes}</p>
              </div>
              <div className="rounded-xl p-2 bg-[#ede9fe]">
                <BellRing className="h-7 w-7 text-[#673193]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TarotStatsCards;
