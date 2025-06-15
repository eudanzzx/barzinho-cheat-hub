
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlanoMonthsSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const PlanoMonthsSelect: React.FC<PlanoMonthsSelectProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-slate-600">Meses</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-[#6B21A8]/10 border-[#6B21A8]/30 focus:border-[#6B21A8]">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {[...Array(12)].map((_, i) => (
            <SelectItem key={i + 1} value={(i + 1).toString()}>
              {i + 1} {i === 0 ? 'mês' : 'meses'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PlanoMonthsSelect;
