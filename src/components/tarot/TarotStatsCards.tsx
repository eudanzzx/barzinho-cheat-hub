
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      case 'semana': return totalRecebidoSemana;
      case 'mes': return totalRecebidoMes;
      case 'ano': return totalRecebidoAno;
      default: return totalRecebido;
    }
  };

  return (
    <div className="mb-8 animate-fade-in">
      {/* Period Selector com estilo igual ao dashboard */}
      <div className="flex gap-2 mb-3">
        {(['semana', 'mes', 'ano', 'total'] as const).map((per) => (
          <Button
            key={per}
            size="sm"
            variant={selectedPeriod === per ? "default" : "outline"}
            className={
              selectedPeriod === per
                ? "bg-tarot-primary text-white border-tarot-primary hover:bg-tarot-primary"
                : "border-[#ede9fe] text-tarot-primary hover:bg-[#ede9fe]"
            }
            onClick={() => onPeriodChange(per)}
            type="button"
          >
            {periodLabels[per]}
          </Button>
        ))}
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/95 border border-[#ede9fe] shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-sm font-medium text-tarot-primary mb-1">Recebido</p>
                <p className="text-2xl font-bold text-tarot-primary">R$ {getRecebido().toFixed(2)}</p>
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
