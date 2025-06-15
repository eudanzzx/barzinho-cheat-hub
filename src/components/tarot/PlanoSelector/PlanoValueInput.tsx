
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PlanoValueInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PlanoValueInput: React.FC<PlanoValueInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-slate-600">Valor Mensal (R$)</Label>
      <Input 
        type="number" 
        placeholder="0.00" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#6B21A8]/10 border-[#6B21A8]/30 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20"
      />
    </div>
  );
};

export default PlanoValueInput;
