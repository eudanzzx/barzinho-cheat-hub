
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface PeriodDropdownProps {
  selectedPeriod: 'semana' | 'mes' | 'ano' | 'total';
  onPeriodChange: (period: 'semana' | 'mes' | 'ano' | 'total') => void;
}

const PeriodDropdown: React.FC<PeriodDropdownProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periodLabels = {
    total: 'Total',
    semana: 'Semana',
    mes: 'Mês', 
    ano: 'Ano'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          {periodLabels[selectedPeriod]}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white border shadow-lg">
        <DropdownMenuItem onClick={() => onPeriodChange('total')}>
          Total
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPeriodChange('semana')}>
          Semana
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPeriodChange('mes')}>
          Mês
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPeriodChange('ano')}>
          Ano
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PeriodDropdown;
