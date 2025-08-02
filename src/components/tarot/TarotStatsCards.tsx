
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
      case "total":
        return totalRecebido;
      default:
        return totalRecebido;
    }
  };

  return (
    <>
      {/* Dropdown principal */}
      <div className="flex justify-start mb-2">
        <div className="w-fit">
          <PeriodDropdown
            selectedPeriod={selectedPeriod}
            onPeriodChange={onPeriodChange}
            variant="tarot"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Recebido */}
        <Card className="bg-tarot-accent border-tarot-primary border-2 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Recebido</p>
                <p className="text-xl font-bold tarot-primary">
                  R$ {getRecebido().toFixed(2)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-tarot-accent">
                <DollarSign className="h-6 w-6 tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Análises */}
        <Card className="bg-tarot-accent border-tarot-primary border-2 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Análises</p>
                <p className="text-xl font-bold tarot-primary">{totalAnalises}</p>
              </div>
              <div className="p-2 rounded-lg bg-tarot-accent">
                <Users className="h-6 w-6 tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finalizados */}
        <Card className="bg-tarot-accent border-tarot-primary border-2 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Finalizados</p>
                <p className="text-xl font-bold tarot-primary">{finalizados}</p>
              </div>
              <div className="p-2 rounded-lg bg-tarot-accent">
                <CheckCircle className="h-6 w-6 tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lembretes */}
        <Card className="bg-tarot-accent border-tarot-primary border-2 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Lembretes</p>
                <p className="text-xl font-bold tarot-primary">{lembretes}</p>
              </div>
              <div className="p-2 rounded-lg bg-tarot-accent">
                <BellRing className="h-6 w-6 tarot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TarotStatsCards;
