
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  detalhes: string;
  setDetalhes: (val: string) => void;
  tratamento: string;
  setTratamento: (val: string) => void;
  indicacao: string;
  setIndicacao: (val: string) => void;
};

const DetalhesSection = ({
  detalhes,
  setDetalhes,
  tratamento,
  setTratamento,
  indicacao,
  setIndicacao,
}: Props) => (
  <>
    <div className="mt-6 space-y-2">
      <Label htmlFor="detalhes" className="text-slate-700">Detalhes da Sessao</Label>
      <Textarea 
        id="detalhes" 
        placeholder="Revelacoes, conselhos e orientacoes..." 
        className="min-h-[120px] bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
        value={detalhes}
        onChange={(e) => setDetalhes(e.target.value)}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="space-y-2">
        <Label htmlFor="tratamento" className="text-slate-700">Tratamento</Label>
        <Textarea 
          id="tratamento" 
          placeholder="Observacoes sobre o tratamento..." 
          className="min-h-[100px] bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
          value={tratamento}
          onChange={(e) => setTratamento(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="indicacao" className="text-slate-700">Indicacao</Label>
        <Textarea 
          id="indicacao" 
          placeholder="Informacoes adicionais e indicacoes..." 
          className="min-h-[100px] bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
          value={indicacao}
          onChange={(e) => setIndicacao(e.target.value)}
        />
      </div>
    </div>
  </>
);

export default DetalhesSection;
