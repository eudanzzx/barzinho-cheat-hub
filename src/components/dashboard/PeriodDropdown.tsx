
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
  tarot: "bg-[#f3e8ff] border border-[#bda3f2] text-[#6B21A8] font-semibold text-[11px] h-6 px-2 py-0 rounded-md shadow-sm focus:ring-1 focus:ring-[#bda3f2] hover:bg-[#ede9fe] transition-all duration-150 min-w-[4.5rem]",
  main: "bg-main-accent border border-main-primary text-main-primary font-bold text-sm h-9 px-5 rounded-lg shadow focus:ring-2 focus:ring-main-primary hover:bg-main-primary hover:text-white transition-all duration-150 min-w-[7rem]",
};

const iconVariants = {
  tarot: "h-3 w-3 text-[#6B21A8] ml-[2px]",
  main: "h-5 w-5 text-main-primary ml-1 group-hover:text-white transition-colors",
};

const itemVariants = {
  tarot: "font-medium text-[#6B21A8] data-[state=checked]:bg-[#f3e8ff] rounded cursor-pointer text-[11px] h-7 px-2",
  main: "font-medium text-main-primary data-[state=checked]:bg-main-accent rounded cursor-pointer text-sm h-9 px-4",
};

const PeriodDropdown: React.FC<PeriodDropdownProps> = ({
  selectedPeriod,
  onPeriodChange,
  variant = "tarot"
}) => {
  return (
    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
      <SelectTrigger className={styleVariants[variant] + " flex gap-1 items-center group"}>
        <SelectValue />
        <ArrowDown className={iconVariants[variant]} />
      </SelectTrigger>
      <SelectContent className={`z-[100] bg-white rounded-lg border shadow-lg ${variant === "main" ? "border-main-primary min-w-[7rem]" : "border-[#bda3f2] min-w-[6rem]"}`}>
        {PERIODS.map(period => (
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
