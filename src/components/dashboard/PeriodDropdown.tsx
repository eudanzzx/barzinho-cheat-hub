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
    "bg-[#ede9fe] border border-[#673193] text-[#673193] font-bold text-[15px] h-9 px-6 py-0 rounded-xl shadow-sm focus:ring-2 focus:ring-[#d1b2f8] hover:bg-[#e9d5ff]/80 transition-all duration-150 min-w-[6.5rem]",
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
