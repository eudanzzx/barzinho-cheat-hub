import React, { useState, useCallback, useMemo, memo } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import ClientInfoFields from "./frequency-analysis/ClientInfoFields";
import AnalysisFields from "./frequency-analysis/AnalysisFields";
import CountersSection from "./frequency-analysis/CountersSection";
import PlanoPaymentButton from "@/components/tarot/PlanoPaymentButton";
import SemanalPaymentButton from "@/components/tarot/SemanalPaymentButton";
import PlanoMensalSection from "./frequency-analysis/PlanoMensalSection";
import PlanoSemanalSection from "./frequency-analysis/PlanoSemanalSection";

const formSchema = z.object({
  clientName: z.string().min(1, "Nome é obrigatório"),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  startDate: z.date({
    required_error: "Data de início é obrigatória",
  }),
  treatmentDays: z.number().int().min(1, "A duração deve ser pelo menos 1 dia"),
  beforeAnalysis: z.string().min(1, "Análise anterior é obrigatória"),
  afterAnalysis: z.string().default(""),
  recommendedTreatment: z.string().min(1, "Tratamento recomendado é obrigatória"),
  price: z.number().min(0, "Valor não pode ser negativo"),
  attention: z.boolean().default(false),
  planoAtivo: z.boolean().default(false),
  planoMeses: z.string().default(""),
  planoValorMensal: z.string().default(""),
  planoDiaVencimento: z.string().default("5"),
  semanalAtivo: z.boolean().default(false),
  semanalSemanas: z.string().default(""),
  semanalValorSemanal: z.string().default(""),
  semanalDiaVencimento: z.string().default("sexta"),
  counters: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Nome do contador é obrigatório"),
      endDate: z.date(),
    })
  ).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface Counter {
  id: string;
  name: string;
  endDate: Date;
}

interface FrequencyAnalysisFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingAnalysis?: any;
}

const FrequencyAnalysisForm: React.FC<FrequencyAnalysisFormProps> = memo(({
  onSubmit,
  onCancel,
  editingAnalysis,
}) => {
  const initialCounters: Counter[] = useMemo(() => 
    (editingAnalysis?.counters || []).map((counter: any) => ({
      id: counter.id || uuidv4(),
      name: counter.name || '',
      endDate: counter.endDate || new Date(),
    })), [editingAnalysis?.counters]
  );
  
  const [counters, setCounters] = useState<Counter[]>(initialCounters);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: editingAnalysis?.client.name || "",
      birthDate: editingAnalysis?.client.birthDate || undefined,
      startDate: editingAnalysis?.startDate || new Date(),
      treatmentDays: editingAnalysis?.treatmentDays || 10,
      beforeAnalysis: editingAnalysis?.beforeAnalysis || "",
      afterAnalysis: editingAnalysis?.afterAnalysis || "",
      recommendedTreatment: editingAnalysis?.recommendedTreatment || "",
      price: editingAnalysis?.price || 0,
      attention: editingAnalysis?.attention || false,
      planoAtivo: editingAnalysis?.planoAtivo || false,
      planoMeses: editingAnalysis?.planoData?.meses || "",
      planoValorMensal: editingAnalysis?.planoData?.valorMensal || "",
      planoDiaVencimento: editingAnalysis?.planoData?.diaVencimento || "5",
      semanalAtivo: editingAnalysis?.semanalAtivo || false,
      semanalSemanas: editingAnalysis?.semanalData?.semanas || "",
      semanalValorSemanal: editingAnalysis?.semanalData?.valorSemanal || "",
      semanalDiaVencimento: editingAnalysis?.semanalData?.diaVencimento || "sexta",
      counters: initialCounters,
    },
  });

  const planoAtivo = form.watch("planoAtivo");
  const semanalAtivo = form.watch("semanalAtivo");

  const handleAddCounter = useCallback(() => {
    const newCounter: Counter = {
      id: uuidv4(),
      name: `Contador ${counters.length + 1}`,
      endDate: new Date(),
    };
    const updatedCounters = [...counters, newCounter];
    setCounters(updatedCounters);
    form.setValue("counters", updatedCounters);
  }, [counters, form]);

  const handleRemoveCounter = useCallback((id: string) => {
    const updatedCounters = counters.filter((counter) => counter.id !== id);
    setCounters(updatedCounters);
    form.setValue("counters", updatedCounters);
  }, [counters, form]);

  const handleUpdateCounter = useCallback((id: string, name: string, endDate: Date) => {
    const updatedCounters = counters.map((counter) =>
      counter.id === id ? { ...counter, name, endDate } : counter
    );
    setCounters(updatedCounters);
    form.setValue("counters", updatedCounters);
  }, [counters, form]);

  const handleSubmit = useCallback((data: FormValues) => {
    const newAnalysis = {
      id: editingAnalysis?.id || uuidv4(),
      client: {
        id: uuidv4(),
        name: data.clientName,
        birthDate: data.birthDate,
        zodiacSign: "",
      },
      startDate: data.startDate,
      treatmentDays: data.treatmentDays,
      beforeAnalysis: data.beforeAnalysis,
      afterAnalysis: data.afterAnalysis,
      recommendedTreatment: data.recommendedTreatment,
      price: data.price,
      attention: data.attention,
      planoAtivo: data.planoAtivo,
      planoData: data.planoAtivo ? {
        meses: data.planoMeses,
        valorMensal: data.planoValorMensal,
        diaVencimento: data.planoDiaVencimento,
      } : null,
      semanalAtivo: data.semanalAtivo,
      semanalData: data.semanalAtivo ? {
        semanas: data.semanalSemanas,
        valorSemanal: data.semanalValorSemanal,
        diaVencimento: data.semanalDiaVencimento,
      } : null,
      counters: data.counters,
      completed: false,
      createdAt: editingAnalysis?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSubmit(newAnalysis);
    form.reset();
  }, [editingAnalysis, onSubmit, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <ClientInfoFields form={form} />
        <AnalysisFields form={form} />

        {/* NOVO: Sempre mostre seção de Plano Mensal */}
        <PlanoMensalSection form={form} editingAnalysis={editingAnalysis} />

        {/* NOVO: Sempre mostre seção Plano Semanal */}
        <PlanoSemanalSection form={form} editingAnalysis={editingAnalysis} />

        <CountersSection
          counters={counters}
          onAddCounter={handleAddCounter}
          onUpdateCounter={handleUpdateCounter}
          onRemoveCounter={handleRemoveCounter}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white"
          >
            Salvar Análise
          </Button>
        </div>
      </form>
    </Form>
  );
});

FrequencyAnalysisForm.displayName = 'FrequencyAnalysisForm';

export default FrequencyAnalysisForm;
