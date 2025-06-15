
import React from "react";
import PlanoSelectorHeader from "./PlanoSelector/PlanoSelectorHeader";
import PlanoMonthsSelect from "./PlanoSelector/PlanoMonthsSelect";
import PlanoValueInput from "./PlanoSelector/PlanoValueInput";
import PlanoDueDateSelect from "./PlanoSelector/PlanoDueDateSelect";

interface PlanoSelectorProps {
  planoAtivo: boolean;
  planoData: {
    meses: string;
    valorMensal: string;
    diaVencimento?: string;
  };
  onPlanoAtivoChange: (value: boolean) => void;
  onPlanoDataChange: (field: string, value: string) => void;
}

const PlanoSelector: React.FC<PlanoSelectorProps> = ({
  planoAtivo,
  planoData,
  onPlanoAtivoChange,
  onPlanoDataChange,
}) => {
  return (
    <div className="space-y-2 flex flex-col">
      <PlanoSelectorHeader 
        planoAtivo={planoAtivo}
        onPlanoAtivoChange={onPlanoAtivoChange}
      />
      
      {planoAtivo && (
        <div className="grid grid-cols-1 gap-2 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <PlanoMonthsSelect
              value={planoData.meses}
              onChange={(value) => onPlanoDataChange("meses", value)}
            />
            <PlanoValueInput
              value={planoData.valorMensal}
              onChange={(value) => onPlanoDataChange("valorMensal", value)}
            />
          </div>
          
          <PlanoDueDateSelect
            value={planoData.diaVencimento || '5'}
            onChange={(value) => onPlanoDataChange("diaVencimento", value)}
          />
        </div>
      )}
    </div>
  );
};

export default PlanoSelector;
