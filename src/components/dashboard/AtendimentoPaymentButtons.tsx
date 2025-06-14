
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import MonthlyPaymentControl from "./MonthlyPaymentControl";
import WeeklyPaymentControl from "./WeeklyPaymentControl";

interface AtendimentoPaymentButtonsProps {
  clientName: string;
}

const AtendimentoPaymentButtons: React.FC<AtendimentoPaymentButtonsProps> = ({
  clientName,
}) => {
  const [monthlyOpen, setMonthlyOpen] = useState(false);
  const [weeklyOpen, setWeeklyOpen] = useState(false);

  const handleMonthlyClick = () => {
    setMonthlyOpen(!monthlyOpen);
    if (weeklyOpen) setWeeklyOpen(false);
  };

  const handleWeeklyClick = () => {
    setWeeklyOpen(!weeklyOpen);
    if (monthlyOpen) setMonthlyOpen(false);
  };

  return (
    <div className="mt-3 space-y-2">
      {/* Botão Pagamentos Mensais */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMonthlyClick}
          className="border-[#0553C7]/30 text-[#0553C7] hover:bg-[#0553C7]/10 hover:border-[#0553C7] transition-colors duration-200 flex items-center gap-2 rounded-lg bg-blue-50/50"
        >
          <Calendar className="h-4 w-4" />
          Pagamentos Mensais
        </Button>
        {monthlyOpen && (
          <div className="mt-2">
            <MonthlyPaymentControl />
          </div>
        )}
      </div>

      {/* Botão Pagamentos Semanais */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleWeeklyClick}
          className="border-emerald-600/30 text-emerald-600 hover:bg-emerald-600/10 hover:border-emerald-600 transition-colors duration-200 flex items-center gap-2 rounded-lg bg-emerald-50/50"
        >
          <Calendar className="h-4 w-4" />
          Pagamentos Semanais
        </Button>
        {weeklyOpen && (
          <div className="mt-2">
            <WeeklyPaymentControl />
          </div>
        )}
      </div>
    </div>
  );
};

export default AtendimentoPaymentButtons;
