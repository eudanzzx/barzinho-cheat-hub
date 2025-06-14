
import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface PeriodDropdownProps {
  selectedPeriod: 'semana' | 'mes' | 'ano' | 'total';
  onPeriodChange: (period: 'semana' | 'mes' | 'ano' | 'total') => void;
  variant?: "main" | "tarot";
}

const PERIODS = [
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
  { value: 'total', label: 'Total' },
];

// Mantém o azul só no main, tarot sempre roxo
const styleVariants = {
  main:
    "bg-main-accent border border-main-primary text-main-primary font-bold text-sm h-9 px-5 rounded-lg shadow focus:ring-2 focus:ring-main-primary hover:bg-main-primary hover:text-white transition-all duration-150 min-w-[7rem]",
  tarot:
    "bg-tarot-accent border border-tarot-primary text-tarot-primary font-bold text-sm h-9 px-5 rounded-lg shadow focus:ring-2 focus:ring-tarot-primary hover:bg-tarot-primary hover:text-white transition-all duration-150 min-w-[7rem]",
};

const itemVariants = {
  main:
    "font-medium text-main-primary data-[state=checked]:bg-main-accent rounded cursor-pointer text-sm h-9 px-4",
  tarot:
    "font-bold text-tarot-primary data-[state=checked]:bg-tarot-accent data-[state=checked]:text-tarot-primary rounded cursor-pointer text-sm h-9 px-4",
};

const PeriodDropdown: React.FC<PeriodDropdownProps> = ({
  selectedPeriod,
  onPeriodChange,
  variant = "main",
}) => {
  return (
    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
      <SelectTrigger
        className={
          styleVariants[variant] +
          " flex gap-2 items-center group justify-between"
        }
      >
        <SelectValue className="font-bold" />
        {/* Ícone removido */}
      </SelectTrigger>
      <SelectContent
        className={`z-[100] bg-white rounded-lg border shadow-lg 
          ${variant === "main"
            ? "border-main-primary min-w-[7rem]"
            : "border-tarot-primary min-w-[7rem]"}
        `}
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

