
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

// Estilo compacto (altura e padding menores, cor roxa predominante do Tarot)
const customStyles =
  "bg-[#f3e8ff] border border-[#bda3f2] text-[#6B21A8] font-semibold text-xs h-8 px-3 py-1 rounded-lg shadow-sm focus:ring-2 focus:ring-[#bda3f2] hover:bg-[#ede9fe] transition-all duration-150 min-w-[6rem]";

const PeriodDropdown: React.FC<PeriodDropdownProps> = ({ selectedPeriod, onPeriodChange }) => {
  return (
    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
      <SelectTrigger className={customStyles + " flex gap-1 items-center"}>
        <SelectValue />
        <ArrowDown className="h-4 w-4 text-[#6B21A8] ml-0.5" />
      </SelectTrigger>
      <SelectContent className="z-[100] bg-white rounded-lg border border-[#bda3f2] shadow-lg">
        {PERIODS.map(period => (
          <SelectItem 
            key={period.value} 
            value={period.value} 
            className="font-medium text-[#6B21A8] data-[state=checked]:bg-[#f3e8ff] rounded cursor-pointer text-xs"
          >
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PeriodDropdown;
