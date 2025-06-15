
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import SemanalPaymentButton from "@/components/tarot/SemanalPaymentButton";

interface PlanoSemanalSectionProps {
  form: any;
  editingAnalysis?: any;
}

const PlanoSemanalSection: React.FC<PlanoSemanalSectionProps> = ({ form, editingAnalysis }) => {
  const semanalAtivo = form.watch("semanalAtivo");

  return (
    <div className="space-y-4 p-4 border border-[#10B981]/20 rounded-lg bg-[#10B981]/5">
      <h3 className="text-lg font-medium text-[#10B981]">Plano Semanal</h3>
      <FormField
        control={form.control}
        name="semanalAtivo"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Ativar Plano Semanal</FormLabel>
              <div className="text-sm text-muted-foreground">
                Ative para configurar pagamentos semanais.
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="semanalSemanas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade de Semanas</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ex: 8"
                  {...field}
                  disabled={!semanalAtivo}
                  className={`bg-white/50 border-[#10B981]/20 focus:border-[#10B981] ${!semanalAtivo ? "opacity-60" : ""}`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="semanalValorSemanal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Semanal (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 37.50"
                  {...field}
                  disabled={!semanalAtivo}
                  className={`bg-white/50 border-[#10B981]/20 focus:border-[#10B981] ${!semanalAtivo ? "opacity-60" : ""}`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="semanalDiaVencimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dia de Vencimento</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={!semanalAtivo}
                  className={`flex h-10 w-full rounded-md border border-[#10B981]/20 bg-white/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${!semanalAtivo ? "opacity-60" : ""}`}
                >
                  <option value="domingo">Domingo</option>
                  <option value="segunda">Segunda-feira</option>
                  <option value="terca">Terça-feira</option>
                  <option value="quarta">Quarta-feira</option>
                  <option value="quinta">Quinta-feira</option>
                  <option value="sexta">Sexta-feira</option>
                  <option value="sabado">Sábado</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-4">
        <SemanalPaymentButton
          analysisId={editingAnalysis?.id || "novo"}
          clientName={form.getValues("clientName") || ""}
          semanalData={{
            semanas: form.getValues("semanalSemanas") || "",
            valorSemanal: form.getValues("semanalValorSemanal") || "",
          }}
          startDate={
            form.getValues("startDate")
              ? form.getValues("startDate").toString()
              : ""
          }
        />
        {!semanalAtivo && (
          <p className="text-xs text-muted-foreground mt-1">
            (Ative o plano semanal para configurar pagamentos. O controle de pagamentos será ativado após salvar a análise)
          </p>
        )}
      </div>
    </div>
  );
};

export default PlanoSemanalSection;
