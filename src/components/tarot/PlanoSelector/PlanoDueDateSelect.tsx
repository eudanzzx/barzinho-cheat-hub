
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlanoDueDateSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const PlanoDueDateSelect: React.FC<PlanoDueDateSelectProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-slate-600">Dia de Vencimento</Label>
      <Select value={value || '5'} onValueChange={onChange}>
        <SelectTrigger className="bg-[#6B21A8]/10 border-[#6B21A8]/30 focus:border-[#6B21A8]">
          <SelectValue placeholder="Dia do mês" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px] overflow-y-auto">
          {[...Array(31)].map((_, i) => (
            <SelectItem key={i + 1} value={(i + 1).toString()}>
              Dia {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PlanoDueDateSelect;
