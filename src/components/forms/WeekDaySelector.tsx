
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WeekDaySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

const WeekDaySelector: React.FC<WeekDaySelectorProps> = ({
  value,
  onChange,
  label,
  placeholder = "Selecione o dia"
}) => {
  const weekDays = [
    { value: 'domingo', label: 'Domingo' },
    { value: 'segunda', label: 'Segunda-feira' },
    { value: 'terca', label: 'Terça-feira' },
    { value: 'quarta', label: 'Quarta-feira' },
    { value: 'quinta', label: 'Quinta-feira' },
    { value: 'sexta', label: 'Sexta-feira' },
    { value: 'sabado', label: 'Sábado' }
  ];

  return (
    <div className="space-y-1">
      <Label className="text-sm text-slate-600">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white/50 border-slate-300 focus:border-emerald-500">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {weekDays.map((day) => (
            <SelectItem key={day.value} value={day.value}>
              {day.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WeekDaySelector;
