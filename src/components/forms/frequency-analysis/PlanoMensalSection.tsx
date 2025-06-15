
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import PlanoPaymentButton from "@/components/tarot/PlanoPaymentButton";

interface PlanoMensalSectionProps {
  form: any;
  editingAnalysis?: any;
}

const PlanoMensalSection: React.FC<PlanoMensalSectionProps> = ({ form, editingAnalysis }) => {
  const planoAtivo = form.watch("planoAtivo");

  return (
    <div className="space-y-4 p-4 border border-[#6B21A8]/20 rounded-lg bg-[#6B21A8]/5">
      <h3 className="text-lg font-medium text-[#6B21A8]">Plano Mensal</h3>
      <FormField
        control={form.control}
        name="planoAtivo"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Ativar Plano Mensal</FormLabel>
              <div className="text-sm text-muted-foreground">
                Ative para configurar pagamentos mensais.
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
          name="planoMeses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade de Meses</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ex: 12"
                  {...field}
                  disabled={!planoAtivo}
                  className={`bg-white/50 border-[#6B21A8]/20 focus:border-[#6B21A8] ${!planoAtivo ? "opacity-60" : ""}`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="planoValorMensal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Mensal (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 150.00"
                  {...field}
                  disabled={!planoAtivo}
                  className={`bg-white/50 border-[#6B21A8]/20 focus:border-[#6B21A8] ${!planoAtivo ? "opacity-60" : ""}`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="planoDiaVencimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dia de Vencimento</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={!planoAtivo}
                  className={`flex h-10 w-full rounded-md border border-[#6B21A8]/20 bg-white/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${!planoAtivo ? "opacity-60" : ""}`}
                >
                  {[...Array(28)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Dia {i + 1}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-4">
        <PlanoPaymentButton
          analysisId={editingAnalysis?.id || "novo"}
          clientName={form.getValues("clientName") || ""}
          planoData={{
            meses: form.getValues("planoMeses") || "",
            valorMensal: form.getValues("planoValorMensal") || "",
          }}
          startDate={
            form.getValues("startDate")
              ? form.getValues("startDate").toString()
              : ""
          }
        />
        {!planoAtivo && (
          <p className="text-xs text-muted-foreground mt-1">
            (Ative o plano mensal para configurar pagamentos. O controle de pagamentos será ativado após salvar a análise)
          </p>
        )}
      </div>
    </div>
  );
};

export default PlanoMensalSection;
