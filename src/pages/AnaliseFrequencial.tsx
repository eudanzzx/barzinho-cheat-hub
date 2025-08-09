import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, BellRing, Calendar } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import useUserDataService from "@/services/userDataService";
import ClientForm from "@/components/tarot/ClientForm";
import AnalysisCards from "@/components/tarot/AnalysisCards";
import PlanoSelector from "@/components/tarot/PlanoSelector";
import SemanalSelector from "@/components/tarot/SemanalSelector";
import DailySemanalNotificationManager from "@/components/DailySemanalNotificationManager";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import { getNextWeekDays } from "@/utils/weekDayCalculator";
import { createPlanoNotifications, createSemanalNotifications } from "@/utils/notificationCreators";
import { useIsMobile } from "@/hooks/use-mobile";

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

const AnaliseFrequencial = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [nomeCliente, setNomeCliente] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [signo, setSigno] = useState("");
  const [atencao, setAtencao] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [preco, setPreco] = useState("");
  const [analiseAntes, setAnaliseAntes] = useState("");
  const [analiseDepois, setAnaliseDepois] = useState("");
  const [planoAtivo, setPlanoAtivo] = useState(false);
  const [semanalAtivo, setSemanalAtivo] = useState(false);
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
  const [analises, setAnalises] = useState<any[]>([]);

  const { checkClientBirthday, saveTarotAnalysisWithPlan, getPlanos, savePlanos } = useUserDataService();
  
  // Verificar notificações ao carregar a página
  useEffect(() => {
    checkNotifications();
  }, []);

  // Verificar aniversário do cliente quando nome e data de nascimento são preenchidos
  useEffect(() => {
    console.log('AnaliseFrequencial - Verificando aniversário para:', { nomeCliente, dataNascimento });
    
    if (nomeCliente && dataNascimento) {
      const isBirthday = checkClientBirthday(dataNascimento); // Fixed: only pass birthDate
      console.log('AnaliseFrequencial - É aniversário:', isBirthday);
      
      // Força uma nova verificação para garantir que o componente seja atualizado
      if (isBirthday) {
        console.log('AnaliseFrequencial - Aniversário detectado! Forçando re-render...');
      }
    }
  }, [nomeCliente, dataNascimento, checkClientBirthday]);

  // Carregar análises ao montar o componente
  useEffect(() => {
    const loadAnalises = () => {
      try {
        const analisesData = JSON.parse(localStorage.getItem("analises") || "[]");
        setAnalises(analisesData);
      } catch (error) {
        console.error('Erro ao carregar análises:', error);
        setAnalises([]);
      }
    };

    loadAnalises();
    // Recarregar análises a cada 30 segundos para manter atualizado
    const interval = setInterval(loadAnalises, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDataNascimentoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDataNascimento(value);
    
    // Lógica para determinar o signo baseado na data de nascimento
    if (value) {
      const date = new Date(value);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      let signoCalculado = "";
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) signoCalculado = "Áries";
      else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) signoCalculado = "Touro";
      else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) signoCalculado = "Gêmeos";
      else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) signoCalculado = "Câncer";
      else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) signoCalculado = "Leão";
      else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) signoCalculado = "Virgem";
      else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) signoCalculado = "Libra";
      else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) signoCalculado = "Escorpião";
      else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) signoCalculado = "Sagitário";
      else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) signoCalculado = "Capricórnio";
      else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) signoCalculado = "Aquário";
      else signoCalculado = "Peixes";
      
      setSigno(signoCalculado);
    } else {
      setSigno("");
    }
  }, []);

  // Verifica se existem tratamentos que atingiram o prazo
  const checkNotifications = useCallback(() => {
    const hoje = new Date();
    const analises = JSON.parse(localStorage.getItem("analises") || "[]");
    
    analises.forEach((analise: any) => {
      if (analise.lembretes) {
        analise.lembretes.forEach((lembrete: any) => {
          if (!lembrete.texto) return;
          
          const dataInicio = new Date(analise.dataInicio);
          
          // Calcular quando o lembrete vai expirar
          const dataExpiracao = new Date(dataInicio);
          dataExpiracao.setDate(dataExpiracao.getDate() + lembrete.dias);
          
          // Calcular diferença em dias
          const diffTime = dataExpiracao.getTime() - hoje.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
          
          // Se falta 1 dia ou menos para expirar
          if (diffDays <= 1 && diffDays > 0) {
            toast.warning(`Tratamento "${lembrete.texto}" para ${analise.nomeCliente} expira em ${diffDays} dia! (${diffHours} horas restantes)`, {
              duration: 10000,
            });
          } 
          // Se expirou hoje
          else if (diffDays === 0 && diffHours > 0) {
            toast.warning(`Tratamento "${lembrete.texto}" para ${analise.nomeCliente} expira em ${diffHours} horas!`, {
              duration: 10000,
            });
          }
          // Se já expirou
          else if (diffDays <= 0) {
            toast.error(`O tratamento "${lembrete.texto}" para ${analise.nomeCliente} expirou!`, {
              duration: 10000,
            });
          }
        });
      }
    });
  }, []);

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
    setPlanoData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSemanalDataChange = useCallback((field: string, value: string) => {
    setSemanalData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSalvarAnalise = useCallback(() => {
    console.log('handleSalvarAnalise - Iniciando salvamento');
    
    // Validar campos obrigatórios
    if (!nomeCliente || !dataInicio) {
      console.log('handleSalvarAnalise - Campos obrigatórios não preenchidos');
      toast.error("Preencha o nome do cliente e a data de início");
      return;
    }

    console.log('handleSalvarAnalise - Dados para salvar:', {
      nomeCliente,
      dataInicio,
      planoAtivo,
      planoData,
      semanalAtivo,
      semanalData,
      lembretes
    });

    try {
      // Gerar ID único para a nova análise
      const novoId = Date.now().toString();
      console.log('handleSalvarAnalise - Novo ID gerado:', novoId);

      // --- GARANTIA: os lembretes devem ser salvos na propriedade 'lembretes' ---
      // E padronizar para sempre usar array [{id, texto, dias}]
      // (remover possíveis contadores antigos/nome diferente)

      const lembretesPadronizados = lembretes.map(l => ({
        id: l.id,
        texto: l.texto,
        dias: l.dias
      }));

      // Preparar dados da análise no formato correto
      const novaAnalise = {
        id: novoId,
        // Required TarotAnalysis properties
        clientName: nomeCliente,
        analysisDate: dataInicio, // Usar diretamente a string sem conversão
        analysisType: "Análise Frequencial",
        paymentStatus: 'pago' as const,
        value: preco || undefined,
        // Legacy fields for backward compatibility
        nomeCliente,
        dataNascimento,
        telefone,
        signo,
        atencao,
        dataInicio,
        dataAtendimento: dataInicio, // Usar diretamente a string sem conversão
        data: new Date().toISOString(),
        preco: preco || undefined,
        pergunta: "Análise Frequencial",
        resposta: analiseAntes + (analiseDepois ? ` | Depois: ${analiseDepois}` : ""),
        dataAnalise: new Date().toISOString(),
        analiseAntes,
        analiseDepois,
        planoAtivo,
        planoData: planoAtivo ? planoData : null,
        semanalAtivo,
        semanalData: semanalAtivo ? {
          semanas: semanalData.semanas,
          valorSemanal: semanalData.valorSemanal,
          diaVencimento: semanalData.diaVencimento
        } : null,
        lembretes: lembretesPadronizados, // ⬅️ salva como 'lembretes' (array do formato correto)
        dataCriacao: new Date().toISOString(),
        finalizado: false,
        status: 'ativo' as const,
        atencaoFlag: atencao,
        valor: preco || "",
        tipoServico: "Tarot Frequencial"
      };

      console.log('handleSalvarAnalise - Nova análise criada:', novaAnalise);

      saveTarotAnalysisWithPlan(novaAnalise);

      // Criar notificações de plano se ativo
      if (planoAtivo && planoData.meses && planoData.valorMensal && dataInicio) {
        const notifications = createPlanoNotifications(
          nomeCliente,
          planoData.meses,
          planoData.valorMensal,
          dataInicio
        );
        
        const existingPlanos = getPlanos() || [];
        const updatedPlanos = [...existingPlanos, ...notifications];
        savePlanos(updatedPlanos);
        
        console.log('handleSalvarAnalise - Notificações de plano criadas:', notifications.length);
      }
      
      // Criar notificações semanais se ativo
      if (semanalAtivo && semanalData.semanas && semanalData.valorSemanal && dataInicio) {
        const notifications = createSemanalNotifications(
          nomeCliente,
          semanalData.semanas,
          semanalData.valorSemanal,
          dataInicio,
          semanalData.diaVencimento || 'sexta'
        );
        
        const existingPlanos = getPlanos() || [];
        const updatedPlanos = [...existingPlanos, ...notifications];
        savePlanos(updatedPlanos);
        
        console.log('handleSalvarAnalise - Notificações semanais criadas:', notifications.length);
      }

      // Verificar se foi salvo corretamente
      const verificacao = JSON.parse(localStorage.getItem("analises") || "[]");
      const analiseEncontrada = verificacao.find((a: any) => a.id === novoId);
      console.log('handleSalvarAnalise - Verificação após salvar:', verificacao.length, 'análises');
      console.log('handleSalvarAnalise - Análise encontrada após salvar:', !!analiseEncontrada);

      if (!analiseEncontrada) {
        console.error('handleSalvarAnalise - ERRO: Análise não foi salva corretamente!');
        toast.error("Erro ao salvar análise - tente novamente");
        return;
      }
      
      // Notificar usuário
      let mensagem = "Análise frequencial salva com sucesso!";
      if (planoAtivo && planoData.meses && planoData.valorMensal) {
        mensagem = `Análise frequencial salva! Plano de ${planoData.meses} meses criado com sucesso.`;
      }
      if (semanalAtivo && semanalData.semanas && semanalData.valorSemanal) {
        if (planoAtivo) {
          mensagem = `Análise frequencial salva! Plano semanal de ${semanalData.semanas} semanas também criado. Vencimentos toda sexta-feira.`;
        } else {
          mensagem = `Análise frequencial salva! Plano semanal de ${semanalData.semanas} semanas criado com sucesso. Vencimentos toda sexta-feira.`;
        }
      }
      
      toast.success(mensagem);
      console.log('handleSalvarAnalise - Sucesso:', mensagem);

      // Configurar lembretes automáticos se necessário
      const lembretesStorage = JSON.parse(localStorage.getItem("lembretes") || "[]");
      
      lembretes.forEach(lembrete => {
        if (lembrete.texto && lembrete.dias > 0) {
          const novoLembrete = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            texto: lembrete.texto,
            dataAlvo: new Date(Date.now() + lembrete.dias * 24 * 60 * 60 * 1000).toISOString(),
            clienteId: novoId,
            clienteNome: nomeCliente
          };
          
          lembretesStorage.push(novoLembrete);
        }
      });
      
      localStorage.setItem("lembretes", JSON.stringify(lembretesStorage));
      
      // Limpar o formulário
      setNomeCliente("");
      setDataNascimento("");
      setTelefone("");
      setSigno("");
      setAtencao(false);
      setDataInicio("");
      setPreco("");
      setAnaliseAntes("");
      setAnaliseDepois("");
      setPlanoAtivo(false);
      setPlanoData({ meses: "", valorMensal: "" });
      setSemanalAtivo(false);
      setSemanalData({ semanas: "", valorSemanal: "", diaVencimento: "sexta" });
      setLembretes([{ id: 1, texto: "", dias: 7 }]);
      
      // Navegar imediatamente após salvar
      console.log('handleSalvarAnalise - Navegando para listagem');
      navigate("/listagem-tarot");

    } catch (error) {
      console.error('handleSalvarAnalise - Erro ao salvar:', error);
      toast.error("Erro ao salvar análise - verifique os dados e tente novamente");
    }
  }, [nomeCliente, dataInicio, dataNascimento, signo, atencao, preco, analiseAntes, analiseDepois, planoAtivo, planoData, semanalAtivo, semanalData, lembretes, navigate, saveTarotAnalysisWithPlan, getPlanos, savePlanos]);

  const handleBack = useCallback(() => {
    navigate("/listagem-tarot");
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Memoize the birthday alert check
  const shouldShowBirthdayAlert = useMemo(() => {
    return nomeCliente && dataNascimento;
  }, [nomeCliente, dataNascimento]);

  return (
    <div className="min-h-screen bg-[#F1F7FF] py-4 sm:py-6 px-2 sm:px-4">
      {/* Adicionar o gerenciador de notificações diárias */}
      <DailySemanalNotificationManager />
      
      <div className="container mx-auto max-w-4xl">
        <div className="mb-4 sm:mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:text-[#6B21A8] transition-colors duration-200" 
            onClick={handleBack}
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Logo height={isMobile ? 32 : 40} width={isMobile ? 32 : 40} />
            <h1 className="text-lg sm:text-2xl font-bold text-[#6B21A8] truncate">
              Tarot Frequencial
            </h1>
          </div>
        </div>

        {shouldShowBirthdayAlert && (
          <ClientBirthdayAlert 
            clientName={nomeCliente}
            birthDate={dataNascimento}
            context="tarot"
          />
        )}

        <Card className="border-[#6B21A8]/20 shadow-sm mb-4 sm:mb-6 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-[#6B21A8] text-lg sm:text-xl">Tarot Frequencial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8">
            <ClientForm
              nomeCliente={nomeCliente}
              dataNascimento={dataNascimento}
              signo={signo}
              telefone={telefone}
              atencao={atencao}
              dataInicio={dataInicio}
              preco={preco}
              onNomeClienteChange={setNomeCliente}
              onDataNascimentoChange={handleDataNascimentoChange}
              onTelefoneChange={setTelefone}
              onAtencaoChange={setAtencao}
              onDataInicioChange={setDataInicio}
              onPrecoChange={setPreco}
            />

            <AnalysisCards
              analiseAntes={analiseAntes}
              analiseDepois={analiseDepois}
              onAnaliseAntesChange={setAnaliseAntes}
              onAnaliseDepoisChange={setAnaliseDepois}
            />

            {/* Seção de Plano */}
            <div>
              <PlanoSelector
                planoAtivo={planoAtivo}
                planoData={planoData}
                onPlanoAtivoChange={setPlanoAtivo}
                onPlanoDataChange={handlePlanoDataChange}
              />
            </div>

            {/* Seção de Plano Semanal */}
            <div>
              <SemanalSelector
                semanalAtivo={semanalAtivo}
                semanalData={semanalData}
                onSemanalAtivoChange={setSemanalAtivo}
                onSemanalDataChange={handleSemanalDataChange}
              />
            </div>
            
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-medium text-[#6B21A8]">Tratamento</h3>
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "default"}
                  className="border-[#6B21A8]/30 text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:border-[#6B21A8] transition-colors duration-200 w-full sm:w-auto"
                  onClick={adicionarLembrete}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              <div className="space-y-4">
                {lembretes.map((lembrete) => (
                  <ReminderCard
                    key={lembrete.id}
                    lembrete={lembrete}
                    onUpdate={atualizarLembrete}
                    onRemove={removerLembrete}
                  />
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors duration-200 w-full sm:w-auto order-2 sm:order-1"
              size={isMobile ? "sm" : "default"}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white transition-colors duration-200 hover:shadow-md w-full sm:w-auto order-1 sm:order-2"
              onClick={handleSalvarAnalise}
              size={isMobile ? "sm" : "default"}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Análise
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AnaliseFrequencial;
