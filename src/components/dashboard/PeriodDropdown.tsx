
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
}

const PERIODS = [
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
  { value: 'total', label: 'Total' },
];

// Estilo ultra-compacto (ainda mais baixo e justo, fonte e ícone menores)
const customStyles =
  "bg-[#f3e8ff] border border-[#bda3f2] text-[#6B21A8] font-semibold text-[11px] h-6 px-2 py-0 rounded-md shadow-sm focus:ring-1 focus:ring-[#bda3f2] hover:bg-[#ede9fe] transition-all duration-150 min-w-[4.5rem]";

const PeriodDropdown: React.FC<PeriodDropdownProps> = ({ selectedPeriod, onPeriodChange }) => {
  return (
    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
      <SelectTrigger className={customStyles + " flex gap-1 items-center h-6 min-h-0"}>
        <SelectValue />
        <ArrowDown className="h-3 w-3 text-[#6B21A8] ml-[2px]" />
      </SelectTrigger>
      <SelectContent className="z-[100] bg-white rounded-lg border border-[#bda3f2] shadow-lg min-w-[6rem]">
        {PERIODS.map(period => (
          <SelectItem
            key={period.value}
            value={period.value}
            className="font-medium text-[#6B21A8] data-[state=checked]:bg-[#f3e8ff] rounded cursor-pointer text-[11px] h-7 px-2"
          >
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PeriodDropdown;
