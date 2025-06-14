import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowDown } from "lucide-react";

interface PeriodDropdownProps {
  selectedPeriod: 'semana' | 'mes' | 'ano' | 'total';
  onPeriodChange: (period: 'semana' | 'mes' | 'ano' | 'total') => void;
  variant?: "main" | "tarot"; // Adicionando variante
}

const PERIODS = [
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
  { value: 'total', label: 'Total' },
];

const styleVariants = {
  tarot:
    "bg-[#f6edff] border border-[#673193] text-[#673193] font-bold text-[15px] h-10 px-8 rounded-xl shadow-none focus:ring-2 focus:ring-[#d1b2f8] hover:bg-[#ede9fe] transition-all duration-150 max-w-[420px] w-full mx-auto outline-none",
  main:
    "bg-main-accent border border-main-primary text-main-primary font-bold text-sm h-9 px-5 rounded-lg shadow focus:ring-2 focus:ring-main-primary hover:bg-main-primary hover:text-white transition-all duration-150 min-w-[7rem]",
};

const iconVariants = {
  tarot: "h-5 w-5 text-[#673193] ml-2",
  main: "h-5 w-5 text-main-primary ml-1 group-hover:text-white transition-colors",
};

const itemVariants = {
  tarot:
    "font-semibold text-[#673193] data-[state=checked]:bg-[#ede9fe] rounded cursor-pointer text-[15px] h-9 px-4",
  main:
    "font-medium text-main-primary data-[state=checked]:bg-main-accent rounded cursor-pointer text-sm h-9 px-4",
};

const PeriodDropdown: React.FC<PeriodDropdownProps> = ({
  selectedPeriod,
  onPeriodChange,
  variant = "tarot",
}) => {
  // Para centralizar ainda mais: se tarot, coloca um wrapper com flex justify-center
  if (variant === 'tarot') {
    return (
      <div className="w-full flex justify-center my-2">
        <div className="w-full max-w-[420px]">
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger
              className={
                styleVariants[variant] +
                " flex gap-2 items-center group justify-between "
              }
              style={{
                boxShadow: "none",
                borderWidth: '2px'
              }}
            >
              <SelectValue className="font-bold"/>
              <ArrowDown className={iconVariants[variant]} />
            </SelectTrigger>
            <SelectContent
              className={`z-[100] bg-white rounded-xl border-2 border-[#673193] min-w-[6.5rem] w-full max-w-[420px]`}
            >
              {PERIODS.map((period) => (
                <SelectItem
                  key={period.value}
                  value={period.value}
                  className={itemVariants[variant]}
                >
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
  return (
    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
      <SelectTrigger
        className={
          styleVariants[variant] +
          " flex gap-2 items-center group justify-between"
        }
      >
        <SelectValue />
        <ArrowDown className={iconVariants[variant]} />
      </SelectTrigger>
      <SelectContent
        className={`z-[100] bg-white rounded-lg border shadow-lg ${
          variant === "main"
            ? "border-main-primary min-w-[7rem]"
            : "border-[#673193] min-w-[6.5rem]"
        }`}
      >
        {PERIODS.map((period) => (
          <SelectItem
            key={period.value}
            value={period.value}
            className={itemVariants[variant]}
          >
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PeriodDropdown;
