
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreditCard } from "lucide-react";

interface PlanoSelectorHeaderProps {
  planoAtivo: boolean;
  onPlanoAtivoChange: (value: boolean) => void;
}

const PlanoSelectorHeader: React.FC<PlanoSelectorHeaderProps> = ({
  planoAtivo,
  onPlanoAtivoChange,
}) => {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="plano" className="text-slate-700 font-medium flex items-center">
        <CreditCard className={`mr-2 h-4 w-4 ${planoAtivo ? "text-[#6B21A8]" : "text-slate-400"}`} />
        PLANO
      </Label>
      <Switch 
        checked={planoAtivo} 
        onCheckedChange={onPlanoAtivoChange} 
        className="data-[state=checked]:bg-[#6B21A8]"
      />
    </div>
  );
};

export default PlanoSelectorHeader;
