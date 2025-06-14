
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

const customStyles = 
  "bg-white shadow border border-blue-200 rounded-lg text-blue-700 font-semibold px-4 py-2" +
  " focus:ring-2 focus:ring-blue-300 min-w-[6rem] hover:bg-blue-100 transition-all duration-150";

const PeriodDropdown: React.FC<PeriodDropdownProps> = ({ selectedPeriod, onPeriodChange }) => {
  return (
    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
      <SelectTrigger className={customStyles + " flex gap-2 items-center"}>
        <SelectValue />
        <ArrowDown className="h-4 w-4 text-blue-500 ml-1" />
      </SelectTrigger>
      <SelectContent className="z-[100] bg-white rounded-lg border border-blue-200 shadow-lg">
        {PERIODS.map(period => (
          <SelectItem 
            key={period.value} 
            value={period.value} 
            className="font-medium text-blue-700 data-[state=checked]:bg-blue-50 rounded cursor-pointer"
          >
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PeriodDropdown;
