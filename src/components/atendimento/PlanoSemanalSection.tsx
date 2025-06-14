
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  semanalAtivo: boolean;
  setSemanalAtivo: (val: boolean) => void;
  semanalData: { semanas: string; valorSemanal: string; diaVencimento: string };
  handleSemanalDataChange: (field: string, value: string) => void;
  diasSemana: { value: string; label: string }[];
};

const PlanoSemanalSection = ({
  semanalAtivo,
  setSemanalAtivo,
  semanalData,
  handleSemanalDataChange,
  diasSemana,
}: Props) => (
  <div className="mt-4 space-y-4 p-4 border border-[#10B981]/20 rounded-lg bg-[#10B981]/5">
    <div className="flex items-center justify-between">
      <Label htmlFor="semanal" className="text-slate-700 font-medium flex items-center">
        <Calendar className={`mr-2 h-4 w-4 ${semanalAtivo ? "text-[#10B981]" : "text-slate-400"}`} />
        PLANO SEMANAL
      </Label>
      <Switch 
        checked={semanalAtivo} 
        onCheckedChange={setSemanalAtivo} 
        className="data-[state=checked]:bg-[#10B981]"
      />
    </div>
    {semanalAtivo && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-slate-600">Quantidade de Semanas</Label>
          <Select value={semanalData.semanas} onValueChange={(value) => handleSemanalDataChange("semanas", value)}>
            <SelectTrigger className="bg-[#10B981]/10 border-[#10B981]/30 focus:border-[#10B981]">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1} {i === 0 ? 'semana' : 'semanas'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-slate-600">Valor Semanal (R$)</Label>
          <Input 
            type="number" 
            placeholder="0.00" 
            value={semanalData.valorSemanal}
            onChange={(e) => handleSemanalDataChange("valorSemanal", e.target.value)}
            className="bg-[#10B981]/10 border-[#10B981]/30 focus:border-[#10B981] focus:ring-[#10B981]/20"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-slate-600">Dia Vencimento</Label>
          <Select value={semanalData.diaVencimento} onValueChange={(value) => handleSemanalDataChange("diaVencimento", value)}>
            <SelectTrigger className="bg-[#10B981]/10 border-[#10B981]/30 focus:border-[#10B981]">
              <SelectValue placeholder="Dia" />
            </SelectTrigger>
            <SelectContent>
              {diasSemana.map((dia) => (
                <SelectItem key={dia.value} value={dia.value}>
                  {dia.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )}
  </div>
);

export default PlanoSemanalSection;
