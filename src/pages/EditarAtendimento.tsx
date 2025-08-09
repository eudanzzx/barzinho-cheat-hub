import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, AlertTriangle, Cake, CreditCard, Calendar, Package } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { updateAtendimentoWithPlans } from "@/utils/updateAtendimentoWithPlans";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import Logo from "@/components/Logo";
import ClienteFields from "@/components/atendimento/ClienteFields";
import PlanoMensalSection from "@/components/atendimento/PlanoMensalSection";
import PlanoSemanalSection from "@/components/atendimento/PlanoSemanalSection";
import PacoteSection from "@/components/atendimento/PacoteSection";
import DetalhesSection from "@/components/atendimento/DetalhesSection";

interface Atendimento {
  id: string;
  nome: string;
  dataAtendimento: string;
  tipoServico: string;
  valor: string;
  statusPagamento?: 'pago' | 'pendente' | 'parcelado';
  dataNascimento?: string;
  telefone?: string;
  signo?: string;
  destino?: string;
  cidade?: string;
  ano?: string;
  detalhes?: string;
  tratamento?: string;
  indicacao?: string;
  atencaoFlag?: boolean;
  atencaoNota?: string;
  planoAtivo?: boolean;
  planoData?: {
    meses: string;
    valorMensal: string;
    diaVencimento?: string;
  } | null;
  semanalAtivo?: boolean;
  semanalData?: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  } | null;
  pacoteAtivo?: boolean;
  pacoteData?: {
    dias: string;
    pacoteDias: Array<{
      id: string;
      data: string;
      valor: string;
    }>;
  } | null;
}

const EditarAtendimento = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userDataService = useUserDataService();
  const { getAtendimentos } = userDataService;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [atendimento, setAtendimento] = useState<Atendimento | null>(null);

  // Adiciona um ref para armazenar se os dados do atendimento já foram carregados
  const hasLoadedData = useRef(false);

  // Individual form states for better control
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");
  const [dataAtendimento, setDataAtendimento] = useState("");
  const [valor, setValor] = useState("");
  const [destino, setDestino] = useState("");
  const [cidade, setCidade] = useState("");
  const [ano, setAno] = useState("");
  const [atencaoNota, setAtencaoNota] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [tratamento, setTratamento] = useState("");
  const [indicacao, setIndicacao] = useState("");
  const [signo, setSigno] = useState("");
  const [atencaoFlag, setAtencaoFlag] = useState(false);
  
  // Novos estados para planos
  const [planoAtivo, setPlanoAtivo] = useState(false);
  const [semanalAtivo, setSemanalAtivo] = useState(false);
  const [pacoteAtivo, setPacoteAtivo] = useState(false);
  const [planoData, setPlanoData] = useState<{
    meses: string;
    valorMensal: string;
    diaVencimento: string;
  }>({
    meses: "",
    valorMensal: "",
    diaVencimento: "5",
  });
  const [semanalData, setSemanalData] = useState<{
    semanas: string;
    valorSemanal: string;
    diaVencimento: string;
  }>({
    semanas: "",
    valorSemanal: "",
    diaVencimento: "sexta",
  });
  const [pacoteData, setPacoteData] = useState<{
    dias: string;
    pacoteDias: Array<{
      id: string;
      data: string;
      valor: string;
    }>;
  }>({
    dias: "",
    pacoteDias: [],
  });

  // Alterado: todos os dias do mês, de 1 a 31
  const diasVencimento = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: `Dia ${i + 1}`,
  }));

  const diasSemana = [
    { value: "domingo", label: "Domingo" },
    { value: "segunda", label: "Segunda-feira" },
    { value: "terca", label: "Terca-feira" },
    { value: "quarta", label: "Quarta-feira" },
    { value: "quinta", label: "Quinta-feira" },
    { value: "sexta", label: "Sexta-feira" },
    { value: "sabado", label: "Sabado" },
  ];

  useEffect(() => {
    const carregarAtendimento = () => {
      console.log('EditarAtendimento - ID recebido:', id);
      
      if (!id) {
        console.error('ID do atendimento não fornecido');
        toast.error("ID do atendimento não fornecido");
        navigate('/');
        return;
      }

      try {
        const atendimentos = getAtendimentos();
        console.log('EditarAtendimento - Total de atendimentos:', atendimentos.length);
        
        const atendimentoEncontrado = atendimentos.find((a: any) => a.id === id);
        console.log('EditarAtendimento - Atendimento encontrado:', atendimentoEncontrado);
        
        if (atendimentoEncontrado) {
          setAtendimento(atendimentoEncontrado);

          // Só inicializa estados SE ainda não carregou antes (flag)
          if (!hasLoadedData.current) {
            setNome(atendimentoEncontrado.nome || "");
            setDataNascimento(atendimentoEncontrado.dataNascimento || "");
            setTelefone(atendimentoEncontrado.telefone || "");
            setTipoServico(atendimentoEncontrado.tipoServico || "");
            setStatusPagamento(atendimentoEncontrado.statusPagamento || "");
            setDataAtendimento(atendimentoEncontrado.dataAtendimento || "");
            setValor(atendimentoEncontrado.valor || "");
            setDestino(atendimentoEncontrado.destino || "");
            setCidade(atendimentoEncontrado.cidade || "");
            setAno(atendimentoEncontrado.ano || "");
            setAtencaoNota(atendimentoEncontrado.atencaoNota || "");
            setDetalhes(atendimentoEncontrado.detalhes || "");
            setTratamento(atendimentoEncontrado.tratamento || "");
            setIndicacao(atendimentoEncontrado.indicacao || "");
            setSigno(atendimentoEncontrado.signo || "");
            setAtencaoFlag(Boolean(atendimentoEncontrado.atencaoFlag));
            setPlanoAtivo(Boolean(atendimentoEncontrado.planoAtivo));
            setSemanalAtivo(Boolean(atendimentoEncontrado.semanalAtivo));
            setPacoteAtivo(Boolean(atendimentoEncontrado.pacoteAtivo));

            if (atendimentoEncontrado.planoData) {
              setPlanoData({
                meses: atendimentoEncontrado.planoData.meses || "",
                valorMensal: atendimentoEncontrado.planoData.valorMensal || "",
                diaVencimento: atendimentoEncontrado.planoData.diaVencimento || "5",
              });
            }

            if (atendimentoEncontrado.semanalData) {
              setSemanalData({
                semanas: atendimentoEncontrado.semanalData.semanas || "",
                valorSemanal: atendimentoEncontrado.semanalData.valorSemanal || "",
                diaVencimento: atendimentoEncontrado.semanalData.diaVencimento || "sexta",
              });
            }

            if (atendimentoEncontrado.pacoteData) {
              setPacoteData({
                dias: atendimentoEncontrado.pacoteData.dias || "",
                pacoteDias: atendimentoEncontrado.pacoteData.pacoteDias || [],
              });
            }

            hasLoadedData.current = true; // Marca como carregado
          }

          console.log('EditarAtendimento - Dados carregados com sucesso');
        } else {
          console.error('Atendimento não encontrado com ID:', id);
          toast.error("Atendimento não encontrado");
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao carregar atendimento:', error);
        toast.error("Erro ao carregar o atendimento");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    carregarAtendimento();
    // Só precisa rodar na montagem (e não toda vez que id muda), mas mantemos id/getAtendimentos por garantia
    // eslint-disable-next-line
  }, [id, getAtendimentos]);

  const checkIfBirthday = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (birth.getDate() === today.getDate() && birth.getMonth() === today.getMonth()) {
      const age = today.getFullYear() - birth.getFullYear();
      toast.success(
        `🎉 Hoje é aniversário desta pessoa! ${age} anos`,
        {
          duration: 8000,
          icon: <Cake className="h-5 w-5" />,
          description: "Não esqueça de parabenizar!"
        }
      );
    }
  };

  const handleDataNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Alterando data de nascimento para:', value);
    setDataNascimento(value);
    
    // Check if it's birthday
    if (value) {
      checkIfBirthday(value);
    }
    
    // Calculate zodiac sign
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
  };

  const handlePlanoDataChange = (field: string, value: string) => {
    setPlanoData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePacoteDataChange = (field: string, value: string) => {
    if (field === "dias") {
      const numDias = parseInt(value) || 0;
      const novosPacoteDias = Array.from({ length: numDias }, (_, index) => ({
        id: `pacote-dia-${Date.now()}-${index}`,
        data: "",
        valor: "",
      }));
      
      setPacoteData(prev => ({
        ...prev,
        dias: value,
        pacoteDias: novosPacoteDias,
      }));
    } else {
      setPacoteData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handlePacoteDiaChange = (id: string, field: string, value: string) => {
    setPacoteData(prev => ({
      ...prev,
      pacoteDias: prev.pacoteDias.map(dia => 
        dia.id === id ? { ...dia, [field]: value } : dia
      ),
    }));
  };

  const handleSemanalDataChange = (field: string, value: string) => {
    setSemanalData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalvarAtendimento = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Tentando salvar atendimento...');
    
    // Validações básicas
    if (!nome.trim()) {
      toast.error("Nome é obrigatório");
      setIsSubmitting(false);
      return;
    }

    if (!dataAtendimento) {
      toast.error("Data do atendimento é obrigatória");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare complete form data with proper typing
      const formData = {
        nome: nome.trim(),
        dataNascimento,
        telefone,
        tipoServico,
        statusPagamento: statusPagamento as 'pago' | 'pendente' | 'parcelado',
        dataAtendimento,
        valor,
        destino,
        cidade,
        ano,
        atencaoNota,
        detalhes,
        tratamento,
        indicacao,
        signo,
        atencaoFlag,
        planoAtivo,
        planoData: planoAtivo ? planoData : null,
        semanalAtivo,
        semanalData: semanalAtivo ? semanalData : null,
        pacoteAtivo,
        pacoteData: pacoteAtivo ? pacoteData : null,
      };
      
      console.log('Dados do formulário que serão salvos:', formData);
      
      const resultado = updateAtendimentoWithPlans({
        id: id!,
        updatedData: formData,
        userDataService
      });
      
      if (resultado) {
        console.log('Atendimento salvo com sucesso:', resultado);
        toast.success("Atendimento atualizado com sucesso!");
        
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        console.error('Erro: resultado do updateAtendimento é null');
        toast.error("Erro ao salvar o atendimento");
      }
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error);
      toast.error("Erro ao salvar o atendimento");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-500 text-white border-green-600";
      case "pendente":
        return "bg-yellow-500 text-white border-yellow-600";
      case "parcelado":
        return "bg-red-500 text-white border-red-600";
      default:
        return "bg-gray-200 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F7FF] flex items-center justify-center">
        <div className="text-center">
          <Logo height={60} width={60} />
          <p className="mt-4 text-slate-600">Carregando atendimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F7FF] py-6 px-4">
      <BirthdayNotifications checkOnMount={false} />
      
      {nome && dataNascimento && (
        <div className="container mx-auto max-w-4xl mb-4">
          <ClientBirthdayAlert 
            clientName={nome}
            birthDate={dataNascimento}
            context="atendimento"
          />
        </div>
      )}
      
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] transition-all duration-200" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Logo height={40} width={40} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Editar Atendimento
            </h1>
          </div>
        </div>

        <Card className="border-[#0EA5E9]/20 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#0EA5E9]">Edição de Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ClienteFields
                nome={nome}
                setNome={setNome}
                dataNascimento={dataNascimento}
                handleDataNascimentoChange={handleDataNascimentoChange}
                signo={signo}
                telefone={telefone}
                setTelefone={setTelefone}
                tipoServico={tipoServico}
                setTipoServico={setTipoServico}
                dataAtendimento={dataAtendimento}
                setDataAtendimento={setDataAtendimento}
                valor={valor}
                setValor={setValor}
                destino={destino}
                setDestino={setDestino}
                cidade={cidade}
                setCidade={setCidade}
                ano={ano}
                setAno={setAno}
                statusPagamento={statusPagamento}
                setStatusPagamento={setStatusPagamento}
                getStatusColor={getStatusColor}
              />

              {/* ATENCAO Flag */}
              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="atencao" className="text-base flex items-center text-slate-700">
                    <AlertTriangle className={`mr-2 h-4 w-4 ${atencaoFlag ? "text-red-500" : "text-slate-400"}`} />
                    ATENCAO
                  </Label>
                  <Switch 
                    checked={atencaoFlag} 
                    onCheckedChange={setAtencaoFlag}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>
                <Input 
                  id="atencaoNota" 
                  placeholder="Pontos de atencao" 
                  className={`transition-all duration-200 ${atencaoFlag ? "border-red-500 bg-red-50" : "bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"}`}
                  value={atencaoNota}
                  onChange={(e) => setAtencaoNota(e.target.value)}
                />
              </div>
            </div>

            {/* Seção de Planos - sempre visível */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Configurações de Planos
              </h3>
              
              <PlanoMensalSection
                planoAtivo={planoAtivo}
                setPlanoAtivo={setPlanoAtivo}
                planoData={planoData}
                handlePlanoDataChange={handlePlanoDataChange}
                diasVencimento={diasVencimento}
              />

              <PlanoSemanalSection
                semanalAtivo={semanalAtivo}
                setSemanalAtivo={setSemanalAtivo}
                semanalData={semanalData}
                handleSemanalDataChange={handleSemanalDataChange}
                diasSemana={diasSemana}
              />

              <PacoteSection
                pacoteAtivo={pacoteAtivo}
                setPacoteAtivo={setPacoteAtivo}
                pacoteData={pacoteData}
                handlePacoteDataChange={handlePacoteDataChange}
                handlePacoteDiaChange={handlePacoteDiaChange}
              />
            </div>

            <DetalhesSection
              detalhes={detalhes}
              setDetalhes={setDetalhes}
              tratamento={tratamento}
              setTratamento={setTratamento}
              indicacao={indicacao}
              setIndicacao={setIndicacao}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              disabled={isSubmitting}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white transition-all duration-200"
              onClick={handleSalvarAtendimento}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EditarAtendimento;
