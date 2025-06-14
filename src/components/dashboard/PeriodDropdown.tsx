
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

// Mantém azul só no main, tarot sempre roxo #6918B4 em todos os detalhes
const styleVariants: Record<'main' | 'tarot', string> = {
  main:
    "bg-main-accent border border-main-primary text-main-primary font-bold text-sm h-9 px-5 rounded-lg shadow focus:ring-2 focus:ring-main-primary hover:bg-main-primary hover:text-white transition-all duration-150 min-w-[7rem]",
  tarot:
    // Tudo 100% roxo: bg, texto, borda, hover, focus, ring
    "bg-[#6918B4] border border-[#6918B4] text-white font-bold text-sm h-9 px-5 rounded-lg shadow focus:ring-2 focus:ring-[#6918B4] hover:bg-[#510d92] hover:text-white transition-all duration-150 min-w-[7rem]",
};

const itemVariants: Record<'main' | 'tarot', string> = {
  main:
    "font-medium text-main-primary data-[state=checked]:bg-main-accent rounded cursor-pointer text-sm h-9 px-4",
  tarot:
    // Texto roxo, selecionado fundo lilás e texto roxo forte
    "font-bold text-[#6918B4] data-[state=checked]:bg-[#E5D6F7] data-[state=checked]:text-[#6918B4] rounded cursor-pointer text-sm h-9 px-4",
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
        {/* Remove ícone de seta, só mostra o valor */}
        <span className="font-bold w-full text-left select-none">
          {
            PERIODS.find((p) => p.value === selectedPeriod)?.label
          }
        </span>
      </SelectTrigger>
      <SelectContent
        className={`z-[100] bg-white rounded-lg border shadow-lg 
          ${
            variant === "main"
              ? "border-main-primary min-w-[7rem]"
              : "border-[#6918B4] min-w-[7rem]"
          }
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
