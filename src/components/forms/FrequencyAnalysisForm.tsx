
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { ArrowLeft, Save, Sparkles, Calendar, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { TarotAnalysis } from "@/services/tarotAnalysisService";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import Logo from "@/components/Logo";
import ClientInfoFields from "@/components/forms/frequency-analysis/ClientInfoFields";
import AnalysisFields from "@/components/forms/frequency-analysis/AnalysisFields";
import CountersSection from "@/components/forms/frequency-analysis/CountersSection";

const formSchema = z.object({
  clientName: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  birthDate: z.date().optional(),
  sign: z.string().optional(),
  startDate: z.date(),
  treatmentDays: z.number().optional(),
  price: z.number().optional().nullable(),
  finalizado: z.boolean().default(false),
  beforeAnalysis: z.string().optional(),
  afterAnalysis: z.string().optional(),
  recommendedTreatment: z.string().optional(),
  attention: z.boolean().default(false),
  lembretes: z.array(
    z.object({
      texto: z.string(),
      dias: z.string(),
    })
  ).optional(),
});

interface FrequencyAnalysisFormProps {
  onSave: (data: TarotAnalysis) => void;
  initialData?: TarotAnalysis;
  onCancel: () => void;
}

const FrequencyAnalysisForm: React.FC<FrequencyAnalysisFormProps> = ({
  onSave,
  initialData,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { saveTarotAnalysisWithPlan } = useUserDataService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planoAtivo, setPlanoAtivo] = useState(initialData?.planoAtivo || false);
  const [semanalAtivo, setSemanalAtivo] = useState(initialData?.semanalAtivo || false);
  const [planoData, setPlanoData] = useState({
    meses: initialData?.planoData?.meses || "",
    valorMensal: initialData?.planoData?.valorMensal || "",
    diaVencimento: initialData?.planoData?.diaVencimento || "5",
  });
  const [semanalData, setSemanalData] = useState({
    semanas: initialData?.semanalData?.semanas || "",
    valorSemanal: initialData?.semanalData?.valorSemanal || "",
    diaVencimento: initialData?.semanalData?.diaVencimento || "sexta",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: initialData?.nomeCliente || initialData?.clientName || "",
      birthDate: initialData?.dataNascimento || initialData?.clientBirthdate ? 
        new Date(new Date(initialData?.dataNascimento || initialData?.clientBirthdate).getTime() + 12 * 60 * 60 * 1000) : undefined,
      sign: initialData?.signo || initialData?.clientSign || "",
      startDate: initialData?.dataInicio || initialData?.analysisDate ? 
        new Date(new Date(initialData?.dataInicio || initialData?.analysisDate).getTime() + 12 * 60 * 60 * 1000) : new Date(),
      treatmentDays: 10,
      price: initialData?.preco || initialData?.value ? Number(initialData?.preco || initialData?.value) : undefined,
      finalizado: initialData?.finalizado || false,
      beforeAnalysis: initialData?.analiseAntes || "",
      afterAnalysis: initialData?.analiseDepois || "",
      recommendedTreatment: initialData?.treatment || "",
      attention: initialData?.atencaoFlag || initialData?.attentionFlag || false,
      lembretes: initialData?.lembretes || [],
    },
  });

  const handlePlanoDataChange = (field: string, value: string) => {
    setPlanoData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSemanalDataChange = (field: string, value: string) => {
    setSemanalData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    console.log('🔍 FrequencyAnalysisForm - handleSubmit started with values:', values);
    console.log('🔍 FrequencyAnalysisForm - startDate raw:', values.startDate);
    console.log('🔍 FrequencyAnalysisForm - startDate formatted:', format(values.startDate, 'yyyy-MM-dd'));
    console.log('🔍 FrequencyAnalysisForm - price value:', values.price);
    
    setIsSubmitting(true);
    try {
      const analysisData: TarotAnalysis = {
        id: initialData?.id || Date.now().toString(),
        clientName: values.clientName,
        clientBirthdate: values.birthDate ? format(values.birthDate, 'yyyy-MM-dd') : undefined,
        clientSign: values.sign,
        analysisDate: format(values.startDate, 'yyyy-MM-dd'),
        analysisType: "frequencial",
        paymentStatus: "pendente",
        value: values.price ? values.price.toString() : undefined,
        finalizado: values.finalizado,
        treatmentDays: values.treatmentDays,
        atencaoFlag: values.attention,
        planoAtivo: planoAtivo,
        planoData: planoAtivo ? planoData : null,
        semanalAtivo: semanalAtivo,
        semanalData: semanalAtivo ? semanalData : null,
        // Legacy fields for backward compatibility
        nomeCliente: values.clientName,
        dataNascimento: values.birthDate ? format(values.birthDate, 'yyyy-MM-dd') : undefined,
        signo: values.sign,
        dataInicio: format(values.startDate, 'yyyy-MM-dd'),
        preco: values.price ? values.price.toString() : undefined,
        analiseAntes: values.beforeAnalysis,
        analiseDepois: values.afterAnalysis,
        treatment: values.recommendedTreatment,
        lembretes: values.lembretes,
      };

      console.log('🔍 FrequencyAnalysisForm - analysisData created:', analysisData);
      console.log('🔍 FrequencyAnalysisForm - analysisDate final:', analysisData.analysisDate);
      console.log('🔍 FrequencyAnalysisForm - value final:', analysisData.value);
      
      saveTarotAnalysisWithPlan(analysisData);

      toast.success(`Análise ${initialData ? 'atualizada' : 'criada'} com sucesso!`);
      onSave(analysisData);
      navigate("/listagem-tarot");
    } catch (error) {
      console.error("Erro ao salvar análise:", error);
      toast.error("Erro ao salvar análise.");
    } finally {
      setIsSubmitting(false);
    }
  }, [initialData, planoAtivo, planoData, saveTarotAnalysisWithPlan, onSave, navigate, semanalAtivo, semanalData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      <BirthdayNotifications checkOnMount={false} />
      
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200" 
            onClick={onCancel}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Logo height={40} width={40} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {initialData ? 'Editar' : 'Nova'} Análise Frequencial
            </h1>
          </div>
        </div>

        <Card className="border-purple-200 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Análise Frequencial
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <ClientInfoFields form={form} />
                <AnalysisFields form={form} />

                {/* Seção de Planos */}
                <div className="space-y-6 border-t border-purple-200 pt-6">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4">Configurações de Planos</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Plano Mensal */}
                    <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="planoAtivo" className="text-lg font-medium text-purple-800 flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          MENSAIS
                        </Label>
                        <Switch 
                          checked={planoAtivo} 
                          onCheckedChange={setPlanoAtivo}
                        />
                      </div>
                      
                      {planoAtivo && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-purple-700">Meses</Label>
                              <Select value={planoData.meses} onValueChange={(value) => handlePlanoDataChange("meses", value)}>
                                <SelectTrigger className="border-purple-300 focus:border-purple-500">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1)}>
                                      {i + 1} {i + 1 === 1 ? 'mês' : 'meses'}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-purple-700">Valor Mensal</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="R$ 0,00"
                                value={planoData.valorMensal}
                                onChange={(e) => handlePlanoDataChange("valorMensal", e.target.value)}
                                className="border-purple-300 focus:border-purple-500"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-purple-700">Dia de Vencimento</Label>
                            <Select value={planoData.diaVencimento} onValueChange={(value) => handlePlanoDataChange("diaVencimento", value)}>
                              <SelectTrigger className="border-purple-300 focus:border-purple-500">
                                <SelectValue placeholder="Dia 5" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 31 }, (_, i) => (
                                  <SelectItem key={i + 1} value={String(i + 1)}>
                                    Dia {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Plano Semanal */}
                    <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="semanalAtivo" className="text-lg font-medium text-green-800 flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Semanal
                        </Label>
                        <Switch 
                          checked={semanalAtivo} 
                          onCheckedChange={setSemanalAtivo}
                        />
                      </div>
                      
                      {semanalAtivo && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-green-700">Semanas</Label>
                              <Select value={semanalData.semanas} onValueChange={(value) => handleSemanalDataChange("semanas", value)}>
                                <SelectTrigger className="border-green-300 focus:border-green-500">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1)}>
                                      {i + 1} {i + 1 === 1 ? 'semana' : 'semanas'}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-green-700">Valor Semanal</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="R$ 0,00"
                                value={semanalData.valorSemanal}
                                onChange={(e) => handleSemanalDataChange("valorSemanal", e.target.value)}
                                className="border-green-300 focus:border-green-500"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-green-700">Dia da Semana</Label>
                            <Select value={semanalData.diaVencimento} onValueChange={(value) => handleSemanalDataChange("diaVencimento", value)}>
                              <SelectTrigger className="border-green-300 focus:border-green-500">
                                <SelectValue placeholder="Sexta-feira" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="domingo">Domingo</SelectItem>
                                <SelectItem value="segunda">Segunda-feira</SelectItem>
                                <SelectItem value="terca">Terça-feira</SelectItem>
                                <SelectItem value="quarta">Quarta-feira</SelectItem>
                                <SelectItem value="quinta">Quinta-feira</SelectItem>
                                <SelectItem value="sexta">Sexta-feira</SelectItem>
                                <SelectItem value="sabado">Sábado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-purple-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {initialData ? 'Atualizar' : 'Salvar'} Análise
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FrequencyAnalysisForm;
