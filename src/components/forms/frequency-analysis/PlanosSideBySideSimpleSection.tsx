
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Calendar, CreditCard } from "lucide-react";

interface Props {
  planoAtivo: boolean;
  setPlanoAtivo: (b: boolean) => void;
  planoMeses: string;
  setPlanoMeses: (s: string) => void;
  planoValorMensal: string;
  setPlanoValorMensal: (s: string) => void;
  planoDiaVencimento: string;
  setPlanoDiaVencimento: (s: string) => void;

  semanalAtivo: boolean;
  setSemanalAtivo: (b: boolean) => void;
  semanalSemanas: string;
  setSemanalSemanas: (s: string) => void;
  semanalValorSemanal: string;
  setSemanalValorSemanal: (s: string) => void;
  semanalDiaVencimento: string;
  setSemanalDiaVencimento: (s: string) => void;
}

const daysOptions = Array.from({length: 31}, (_, i) => ({ value: (i + 1).toString(), label: `Dia ${i + 1}` }));
const weekDays = [
  { value: "domingo", label: "Domingo" },
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
];

const PlanosSideBySideSimpleSection: React.FC<Props> = (props) => {
  return (
    <div className="w-full py-4 px-2 bg-white rounded shadow border border-[#e5e7eb] flex flex-col md:flex-row items-stretch gap-5 mb-6">
      {/* Plano Mensal */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className={cn("h-4 w-4", props.planoAtivo ? "text-sky-500" : "text-gray-400")} />
          <span className="text-sm font-semibold text-slate-700">PLANO MENSAL</span>
          <div className="ml-auto">
            <Switch checked={props.planoAtivo} onCheckedChange={props.setPlanoAtivo} className="data-[state=checked]:bg-sky-400" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          {/* Meses */}
          <div className="flex-1">
            <label className="text-xs text-slate-700">Meses</label>
            <select
              className="w-full rounded border bg-sky-50 border-sky-200 text-xs py-2 px-2 focus:outline-none focus:border-sky-400"
              value={props.planoMeses}
              onChange={e => props.setPlanoMeses(e.target.value)}
              disabled={!props.planoAtivo}
            >
              <option value="">Selecione</option>
              {Array.from({length: 12}, (_ ,i) =>
                <option value={String(i+1)} key={i+1}>{i+1}</option>
              )}
            </select>
          </div>
          {/* Valor mensal */}
          <div className="flex-1">
            <label className="text-xs text-slate-700">Valor Mensal (R$)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={props.planoValorMensal}
              onChange={e => props.setPlanoValorMensal(e.target.value)}
              disabled={!props.planoAtivo}
              className="bg-sky-50 border-sky-200 text-xs"
            />
          </div>
          {/* Dia de vencimento */}
          <div className="flex-1">
            <label className="text-xs text-slate-700">Dia Vencimento</label>
            <select
              value={props.planoDiaVencimento}
              onChange={e => props.setPlanoDiaVencimento(e.target.value)}
              className="w-full rounded border bg-sky-50 border-sky-200 text-xs py-2 px-2 focus:outline-none focus:border-sky-400"
              disabled={!props.planoAtivo}
            >
              <option value="">Dia</option>
              {daysOptions.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Plano Semanal */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className={cn("h-4 w-4", props.semanalAtivo ? "text-green-500" : "text-gray-400")} />
          <span className="text-sm font-semibold text-slate-700">PLANO SEMANAL</span>
          <div className="ml-auto">
            <Switch checked={props.semanalAtivo} onCheckedChange={props.setSemanalAtivo} className="data-[state=checked]:bg-green-500" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          {/* Semanas */}
          <div className="flex-1">
            <label className="text-xs text-slate-700">Semanas</label>
            <select
              value={props.semanalSemanas}
              onChange={e => props.setSemanalSemanas(e.target.value)}
              disabled={!props.semanalAtivo}
              className="w-full rounded border bg-emerald-50 border-green-200 text-xs py-2 px-2 focus:outline-none focus:border-green-400"
            >
              <option value="">Selecione</option>
              {Array.from({length: 12}, (_ ,i) =>
                <option value={String(i+1)} key={i+1}>{i+1}</option>
              )}
            </select>
          </div>
          {/* Valor semanal */}
          <div className="flex-1">
            <label className="text-xs text-slate-700">Valor Semanal (R$)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={props.semanalValorSemanal}
              onChange={e => props.setSemanalValorSemanal(e.target.value)}
              disabled={!props.semanalAtivo}
              className="bg-emerald-50 border-green-200 text-xs"
            />
          </div>
          {/* Dia de vencimento semanal */}
          <div className="flex-1">
            <label className="text-xs text-slate-700">Dia Vencimento</label>
            <select
              value={props.semanalDiaVencimento}
              onChange={e => props.setSemanalDiaVencimento(e.target.value)}
              className="w-full rounded border bg-emerald-50 border-green-200 text-xs py-2 px-2 focus:outline-none focus:border-green-400"
              disabled={!props.semanalAtivo}
            >
              <option value="">Dia</option>
              {weekDays.map(dia => (
                <option key={dia.value} value={dia.value}>{dia.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanosSideBySideSimpleSection;
