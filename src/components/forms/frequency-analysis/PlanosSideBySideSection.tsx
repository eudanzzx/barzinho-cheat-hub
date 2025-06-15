
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Calendar, CreditCard } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface PlanosSideBySideSectionProps {
  form: any;
  editingAnalysis?: any;
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

const PlanosSideBySideSection: React.FC<PlanosSideBySideSectionProps> = ({ form, editingAnalysis }) => {
  const planoAtivo = form.watch("planoAtivo");
  const semanalAtivo = form.watch("semanalAtivo");

  return (
    <div className="w-full py-4 px-2 bg-white rounded shadow border border-[#e5e7eb] flex flex-col md:flex-row items-stretch gap-5 mb-6">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className={cn("h-4 w-4", planoAtivo ? "text-sky-500" : "text-gray-400")} />
          <span className="text-sm font-semibold text-slate-700">PLANO MENSAL</span>
          <div className="ml-auto">
            <Switch checked={planoAtivo} onCheckedChange={(val: boolean) => form.setValue("planoAtivo", val)} className="data-[state=checked]:bg-sky-400" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          {/* Meses */}
          <FormField
            control={form.control}
            name="planoMeses"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-slate-700">Meses</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded border bg-sky-50 border-sky-200 text-xs py-2 px-2 focus:outline-none focus:border-sky-400"
                    disabled={!planoAtivo}
                  >
                    <option value="">Selecione</option>
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Valor mensal */}
          <FormField
            control={form.control}
            name="planoValorMensal"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-slate-700">Valor Mensal (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    disabled={!planoAtivo}
                    className="bg-sky-50 border-sky-200 text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Dia de vencimento */}
          <FormField
            control={form.control}
            name="planoDiaVencimento"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-slate-700">Dia Vencimento</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded border bg-sky-50 border-sky-200 text-xs py-2 px-2 focus:outline-none focus:border-sky-400"
                    disabled={!planoAtivo}
                  >
                    <option value="">Dia</option>
                    {daysOptions.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className={cn("h-4 w-4", semanalAtivo ? "text-green-500" : "text-gray-400")} />
          <span className="text-sm font-semibold text-slate-700">PLANO SEMANAL</span>
          <div className="ml-auto">
            <Switch checked={semanalAtivo} onCheckedChange={(val: boolean) => form.setValue("semanalAtivo", val)} className="data-[state=checked]:bg-green-500" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          {/* Semanas */}
          <FormField
            control={form.control}
            name="semanalSemanas"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-slate-700">Semanas</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded border bg-emerald-50 border-green-200 text-xs py-2 px-2 focus:outline-none focus:border-green-400"
                    disabled={!semanalAtivo}
                  >
                    <option value="">Selecione</option>
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Valor semanal */}
          <FormField
            control={form.control}
            name="semanalValorSemanal"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-slate-700">Valor Semanal (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    disabled={!semanalAtivo}
                    className="bg-emerald-50 border-green-200 text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Dia de vencimento semanal */}
          <FormField
            control={form.control}
            name="semanalDiaVencimento"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-slate-700">Dia Vencimento</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded border bg-emerald-50 border-green-200 text-xs py-2 px-2 focus:outline-none focus:border-green-400"
                    disabled={!semanalAtivo}
                  >
                    <option value="">Dia</option>
                    {weekDays.map(dia => (
                      <option key={dia.value} value={dia.value}>{dia.label}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default PlanosSideBySideSection;

