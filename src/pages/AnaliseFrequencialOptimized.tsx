import React, { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, BellRing } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOptimizedDebounce } from "@/hooks/useOptimizedDebounce";

// Lazy load components that aren't immediately needed
const Logo = lazy(() => import("@/components/Logo"));
const ClientBirthdayAlert = lazy(() => import("@/components/ClientBirthdayAlert"));
const ClientForm = lazy(() => import("@/components/tarot/OptimizedClientForm"));
const AnalysisCards = lazy(() => import("@/components/tarot/AnalysisCards"));
const PlanoSelector = lazy(() => import("@/components/tarot/PlanoSelector"));
const SemanalSelector = lazy(() => import("@/components/tarot/SemanalSelector"));

import useUserDataService from "@/services/userDataService";
import { createPlanoNotifications, createSemanalNotifications } from "@/utils/notificationCreators";

// Memoized reminder component to prevent unnecessary re-renders
const ReminderCard = memo(({ lembrete, onUpdate, onRemove }: {
  lembrete: any;
  onUpdate: (id: number, campo: string, valor: any) => void;
  onRemove: (id: number) => void;
}) => {
  const isMobile = useIsMobile();
  
  const handleTextoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(lembrete.id, 'texto', e.target.value);
  }, [lembrete.id, onUpdate]);

  const handleDiasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(lembrete.id, 'dias', parseInt(e.target.value) || 0);
  }, [lembrete.id, onUpdate]);

  const handleRemoveClick = useCallback(() => {
    onRemove(lembrete.id);
  }, [lembrete.id, onRemove]);

  return (
    <div className="flex flex-col gap-3 p-3 border border-slate-200 rounded-md bg-white/50 hover:bg-white/70 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <BellRing className="h-5 w-5 text-[#6B21A8] flex-shrink-0" />
        <span className="font-medium text-[#6B21A8] text-sm sm:text-base">Contador {lembrete.id}</span>
        <div className="flex-grow"></div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 flex-shrink-0"
          onClick={handleRemoveClick}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
      
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        <div className={isMobile ? '' : 'md:col-span-2'}>
          <Textarea 
            placeholder="Descrição do tratamento..." 
            value={lembrete.texto}
            onChange={handleTextoChange}
            className="min-h-[80px] bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200 text-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="whitespace-nowrap text-slate-600 text-sm">Avisar daqui a</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input 
              type="number" 
              className="w-16 sm:w-20 bg-white/50 border-slate-200 focus:border-[#6B21A8] focus:ring-[#6B21A8]/20 transition-colors duration-200 text-sm" 
              value={lembrete.dias}
              onChange={handleDiasChange}
            />
            <span className="whitespace-nowrap text-slate-600 text-sm">dias</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ReminderCard.displayName = 'ReminderCard';

const AnaliseFrequencialOptimized = memo(() => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Form state
  const [formData, setFormData] = useState({
    nomeCliente: "",
    dataNascimento: "",
    signo: "",
    atencao: false,
    dataInicio: "",
    preco: "",
    analiseAntes: "",
    analiseDepois: "",
    planoAtivo: false,
    semanalAtivo: false,
  });

  const [planoData, setPlanoData] = useState({
    meses: "",
    valorMensal: "",
  });
  
  const [semanalData, setSemanalData] = useState({
    semanas: "",
    valorSemanal: "",
    diaVencimento: "sexta",
  });
  
  const [lembretes, setLembretes] = useState([
    { id: 1, texto: "", dias: 7 }
  ]);

  const { checkClientBirthday, saveTarotAnalysisWithPlan, getPlanos, savePlanos } = useUserDataService();

  // Debounced values for expensive operations
  const debouncedNomeCliente = useOptimizedDebounce(formData.nomeCliente, 300);
  const debouncedDataNascimento = useOptimizedDebounce(formData.dataNascimento, 300);

  // Memoized form update function
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoized signo calculation
  const calculatedSigno = useMemo(() => {
    if (!formData.dataNascimento) return "";
    
    const date = new Date(formData.dataNascimento);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Áries";
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Touro";
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gêmeos";
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Câncer";
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leão";
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgem";
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpião";
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitário";
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricórnio";
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquário";
    else return "Peixes";
  }, [formData.dataNascimento]);

  // Update signo when calculated value changes
  useEffect(() => {
    if (calculatedSigno !== formData.signo) {
      setFormData(prev => ({ ...prev, signo: calculatedSigno }));
    }
  }, [calculatedSigno, formData.signo]);

  // Birthday check with debounced values
  const aniversarianteHoje = useMemo(() => {
    if (debouncedNomeCliente && debouncedDataNascimento) {
      const isBirthday = checkClientBirthday(debouncedDataNascimento);
      return isBirthday ? {
        nome: debouncedNomeCliente,
        dataNascimento: debouncedDataNascimento
      } : null;
    }
    return null;
  }, [debouncedNomeCliente, debouncedDataNascimento, checkClientBirthday]);

  // Memoized callback functions
  const adicionarLembrete = useCallback(() => {
    const novoId = lembretes.length > 0 
      ? Math.max(...lembretes.map(l => l.id)) + 1 
      : 1;
    
    setLembretes(prev => [
      ...prev, 
      { id: novoId, texto: "", dias: 7 }
    ]);
  }, [lembretes]);

  const removerLembrete = useCallback((id: number) => {
    setLembretes(prev => prev.filter(item => item.id !== id));
  }, []);

  const atualizarLembrete = useCallback((id: number, campo: string, valor: any) => {
    setLembretes(prev => prev.map(l => 
      l.id === id ? { ...l, [campo]: valor } : l
    ));
  }, []);

  const handlePlanoDataChange = useCallback((field: string, value: string) => {
    setPlanoData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSemanalDataChange = useCallback((field: string, value: string) => {
    setSemanalData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSalvarAnalise = useCallback(() => {
    if (!formData.nomeCliente || !formData.dataInicio) {
      toast.error("Preencha o nome do cliente e a data de início");
      return;
    }

    try {
      const novoId = Date.now().toString();
      const lembretesPadronizados = lembretes.map(l => ({
        id: l.id,
        texto: l.texto,
        dias: l.dias
      }));

      const novaAnalise = {
        id: novoId,
        clientName: formData.nomeCliente,
        analysisDate: new Date().toISOString(),
        analysisType: "Análise Frequencial",
        paymentStatus: 'pago' as const,
        value: formData.preco || "150",
        nomeCliente: formData.nomeCliente,
        dataNascimento: formData.dataNascimento,
        signo: formData.signo,
        atencao: formData.atencao,
        dataInicio: formData.dataInicio,
        dataAtendimento: formData.dataInicio,
        data: new Date().toISOString(),
        preco: formData.preco || "150",
        pergunta: "Análise Frequencial",
        resposta: formData.analiseAntes + (formData.analiseDepois ? ` | Depois: ${formData.analiseDepois}` : ""),
        dataAnalise: new Date().toISOString(),
        analiseAntes: formData.analiseAntes,
        analiseDepois: formData.analiseDepois,
        planoAtivo: formData.planoAtivo,
        planoData: formData.planoAtivo ? planoData : null,
        semanalAtivo: formData.semanalAtivo,
        semanalData: formData.semanalAtivo ? semanalData : null,
        lembretes: lembretesPadronizados,
        dataCriacao: new Date().toISOString(),
        finalizado: false,
        status: 'ativo' as const,
        atencaoFlag: formData.atencao,
        valor: formData.preco || "150",
        tipoServico: "Tarot Frequencial"
      };

      saveTarotAnalysisWithPlan(novaAnalise);

      // Create plan notifications
      if (formData.planoAtivo && planoData.meses && planoData.valorMensal && formData.dataInicio) {
        const notifications = createPlanoNotifications(
          formData.nomeCliente,
          planoData.meses,
          planoData.valorMensal,
          formData.dataInicio
        );
        const existingPlanos = getPlanos() || [];
        savePlanos([...existingPlanos, ...notifications]);
      }
      
      // Create weekly notifications
      if (formData.semanalAtivo && semanalData.semanas && semanalData.valorSemanal && formData.dataInicio) {
        const notifications = createSemanalNotifications(
          formData.nomeCliente,
          semanalData.semanas,
          semanalData.valorSemanal,
          formData.dataInicio,
          semanalData.diaVencimento || 'sexta'
        );
        const existingPlanos = getPlanos() || [];
        savePlanos([...existingPlanos, ...notifications]);
      }

      toast.success("Análise frequencial salva com sucesso!");
      
      // Reset form
      setFormData({
        nomeCliente: "",
        dataNascimento: "",
        signo: "",
        atencao: false,
        dataInicio: "",
        preco: "",
        analiseAntes: "",
        analiseDepois: "",
        planoAtivo: false,
        semanalAtivo: false,
      });
      setPlanoData({ meses: "", valorMensal: "" });
      setSemanalData({ semanas: "", valorSemanal: "", diaVencimento: "sexta" });
      setLembretes([{ id: 1, texto: "", dias: 7 }]);
      
      navigate("/listagem-tarot");
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error("Erro ao salvar análise");
    }
  }, [formData, planoData, semanalData, lembretes, saveTarotAnalysisWithPlan, getPlanos, savePlanos, navigate]);

  // Loading fallback component
  const LoadingFallback = memo(() => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Suspense fallback={<LoadingFallback />}>
          <Logo />
        </Suspense>

        {aniversarianteHoje && (
          <Suspense fallback={<LoadingFallback />}>
            <ClientBirthdayAlert
              clientName={aniversarianteHoje.nome}
              birthDate={aniversarianteHoje.dataNascimento}
              context="tarot"
            />
          </Suspense>
        )}

        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/listagem-tarot")}
            className="flex items-center gap-2 hover:bg-purple-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Lista
          </Button>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl">
            <CardTitle className="text-center text-xl font-bold">
              ✨ Nova Análise Frequencial ✨
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <Suspense fallback={<LoadingFallback />}>
              <ClientForm 
                formData={formData}
                onUpdateFormData={updateFormData}
              />
            </Suspense>

            <Suspense fallback={<LoadingFallback />}>
              <AnalysisCards
                analiseAntes={formData.analiseAntes}
                analiseDepois={formData.analiseDepois}
                onAnaliseAntesChange={(value) => updateFormData('analiseAntes', value)}
                onAnaliseDepoisChange={(value) => updateFormData('analiseDepois', value)}
                value={formData.preco}
                onChange={(value) => updateFormData('preco', value)}
              />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<LoadingFallback />}>
                <PlanoSelector
                  planoAtivo={formData.planoAtivo}
                  onPlanoAtivoChange={(value) => updateFormData('planoAtivo', value)}
                  planoData={planoData}
                  onPlanoDataChange={handlePlanoDataChange}
                />
              </Suspense>

              <Suspense fallback={<LoadingFallback />}>
                <SemanalSelector
                  semanalAtivo={formData.semanalAtivo}
                  onSemanalAtivoChange={(value) => updateFormData('semanalAtivo', value)}
                  semanalData={semanalData}
                  onSemanalDataChange={handleSemanalDataChange}
                />
              </Suspense>
            </div>

            {/* Tratamento Lembretes - Keep as is since it's already optimized */}
            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BellRing className="h-6 w-6" />
                  Contadores de Tratamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {lembretes.map(lembrete => (
                  <ReminderCard
                    key={lembrete.id}
                    lembrete={lembrete}
                    onUpdate={atualizarLembrete}
                    onRemove={removerLembrete}
                  />
                ))}
                
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={adicionarLembrete} 
                    variant="outline"
                    className="flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Contador
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>

          <CardFooter className="bg-gray-50 rounded-b-2xl p-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button 
                variant="outline" 
                onClick={() => navigate("/listagem-tarot")}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSalvarAnalise}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Análise
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
});

AnaliseFrequencialOptimized.displayName = 'AnaliseFrequencialOptimized';

export default AnaliseFrequencialOptimized;
