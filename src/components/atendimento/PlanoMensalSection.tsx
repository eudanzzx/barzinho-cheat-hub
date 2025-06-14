
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  planoAtivo: boolean;
  setPlanoAtivo: (val: boolean) => void;
  planoData: { meses: string; valorMensal: string; diaVencimento: string };
  handlePlanoDataChange: (field: string, value: string) => void;
  diasVencimento: { value: string; label: string }[];
};

const PlanoMensalSection = ({
  planoAtivo,
  setPlanoAtivo,
  planoData,
  handlePlanoDataChange,
  diasVencimento,
}: Props) => (
  <div className="mt-6 space-y-4 p-4 border border-[#0EA5E9]/20 rounded-lg bg-[#0EA5E9]/5">
    <div className="flex items-center justify-between">
      <Label htmlFor="plano" className="text-slate-700 font-medium flex items-center">
        <CreditCard className={`mr-2 h-4 w-4 ${planoAtivo ? "text-[#0EA5E9]" : "text-slate-400"}`} />
        PLANO MENSAL
      </Label>
      <Switch 
        checked={planoAtivo} 
        onCheckedChange={setPlanoAtivo} 
        className="data-[state=checked]:bg-[#0EA5E9]"
      />
    </div>
    {planoAtivo && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-slate-600">Quantidade de Meses</Label>
          <Select value={planoData.meses} onValueChange={(value) => handlePlanoDataChange("meses", value)}>
            <SelectTrigger className="bg-[#0EA5E9]/10 border-[#0EA5E9]/30 focus:border-[#0EA5E9]">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1} {i === 0 ? 'mes' : 'meses'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-slate-600">Valor Mensal (R$)</Label>
          <Input 
            type="number" 
            placeholder="0.00" 
            value={planoData.valorMensal}
            onChange={(e) => handlePlanoDataChange("valorMensal", e.target.value)}
            className="bg-[#0EA5E9]/10 border-[#0EA5E9]/30 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-slate-600">Dia Vencimento</Label>
          <Select value={planoData.diaVencimento} onValueChange={(value) => handlePlanoDataChange("diaVencimento", value)}>
            <SelectTrigger className="bg-[#0EA5E9]/10 border-[#0EA5E9]/30 focus:border-[#0EA5E9]">
              <SelectValue placeholder="Dia" />
            </SelectTrigger>
            <SelectContent>
              {diasVencimento.map((dia) => (
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

export default PlanoMensalSection;
