import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useUserDataService, { AtendimentoData } from "@/services/userDataService";
import { createPlanoNotifications, createSemanalNotifications } from "@/utils/notificationCreators";

interface SaveAtendimentoParams {
  formData: any;
  signo: string;
  atencao: boolean;
  planoAtivo: boolean;
  planoData: {
    meses: string;
    valorMensal: string;
    diaVencimento: string;
  };
  semanalAtivo: boolean;
  semanalData: {
    semanas: string;
    valorSemanal: string;
    diaVencimento: string;
  };
  pacoteAtivo: boolean;
  pacoteData: {
    dias: string;
    pacoteDias: Array<{
      id: string;
      data: string;
      valor: string;
    }>;
  };
}

export const useAtendimentoSave = () => {
  const navigate = useNavigate();
  const { getAtendimentos, saveAtendimentos, savePlanos, getPlanos } = useUserDataService();


  const handleSaveAndFinish = ({
    formData,
    signo,
    atencao,
    planoAtivo,
    planoData,
    semanalAtivo,
    semanalData,
    pacoteAtivo,
    pacoteData
  }: SaveAtendimentoParams) => {
    console.log('🔍 DEBUG - Data recebida no save:', {
      dataAtendimento: formData.dataAtendimento,
      typeOfData: typeof formData.dataAtendimento,
      formDataComplete: formData
    });
    
    const existingAtendimentos = getAtendimentos();
    
    // Corrigir problema de timezone na data - garantir formato correto
    let dataCorrigida = formData.dataAtendimento;
    if (dataCorrigida) {
      // Garantir que a data seja mantida exatamente como inserida (YYYY-MM-DD)
      // Sem conversões de timezone que podem alterar o dia
      if (typeof dataCorrigida === 'string' && dataCorrigida.includes('-')) {
        // Se já está no formato YYYY-MM-DD, manter
        dataCorrigida = dataCorrigida;
      } else if (dataCorrigida instanceof Date) {
        // Se for Date, converter para string local sem timezone
        const year = dataCorrigida.getFullYear();
        const month = String(dataCorrigida.getMonth() + 1).padStart(2, '0');
        const day = String(dataCorrigida.getDate()).padStart(2, '0');
        dataCorrigida = `${year}-${month}-${day}`;
      }
    }
    
    const novoAtendimento: AtendimentoData = {
      id: Date.now().toString(),
      ...formData,
      statusPagamento: formData.statusPagamento as 'pago' | 'pendente' | 'parcelado',
      signo,
      atencaoFlag: atencao,
      data: dataCorrigida,
      dataAtendimento: dataCorrigida,
      planoAtivo,
      planoData: planoAtivo ? planoData : null,
      semanalAtivo,
      semanalData: semanalAtivo ? semanalData : null,
      pacoteAtivo,
      pacoteData: pacoteAtivo ? pacoteData : null,
    };
    
    console.log('💾 DEBUG - Objeto que será salvo:', {
      id: novoAtendimento.id,
      data: novoAtendimento.data,
      dataAtendimento: novoAtendimento.dataAtendimento,
      nome: novoAtendimento.nome
    });
    
    existingAtendimentos.push(novoAtendimento);
    saveAtendimentos(existingAtendimentos);
    
    // Criar notificações de plano se ativo - agora passando o dia de vencimento
    if (planoAtivo && planoData.meses && planoData.valorMensal && formData.dataAtendimento) {
      const notifications = createPlanoNotifications(
        formData.nome,
        planoData.meses,
        planoData.valorMensal,
        formData.dataAtendimento,
        planoData.diaVencimento
      );
      
      const existingPlanos = getPlanos() || [];
      const updatedPlanos = [...existingPlanos, ...notifications];
      savePlanos(updatedPlanos);
      
      const diaVencimentoLabel = planoData.diaVencimento || "5";
      toast.success(`Atendimento salvo! Plano de ${planoData.meses} meses criado com vencimentos no dia ${diaVencimentoLabel}.`);
    }
    
    // Criar notificações semanais se ativo
    if (semanalAtivo && semanalData.semanas && semanalData.valorSemanal && semanalData.diaVencimento && formData.dataAtendimento) {
      console.log('🚀 TESTE CORREÇÃO - useAtendimentoSave criando planos semanais:', {
        diaVencimento: semanalData.diaVencimento,
        dataAtendimento: formData.dataAtendimento,
        semanas: semanalData.semanas,
        cliente: formData.nome,
        timestamp: new Date().toISOString()
      });
      
      const notifications = createSemanalNotifications(
        formData.nome,
        semanalData.semanas,
        semanalData.valorSemanal,
        formData.dataAtendimento,
        semanalData.diaVencimento
      );
      
      console.log('🔧 CORRIGIDO - Notificações semanais criadas:', 
        notifications.map(n => ({ 
          week: n.week, 
          dueDate: n.dueDate,
          dayOfWeek: new Date(n.dueDate).getDay() 
        }))
      );
      
      const existingPlanos = getPlanos() || [];
      const updatedPlanos = [...existingPlanos, ...notifications];
      savePlanos(updatedPlanos);
      
      const diaLabel = {
        'segunda': 'segunda-feira',
        'terca': 'terça-feira', 
        'quarta': 'quarta-feira',
        'quinta': 'quinta-feira',
        'sexta': 'sexta-feira',
        'sabado': 'sábado',
        'domingo': 'domingo'
      }[semanalData.diaVencimento] || semanalData.diaVencimento;
      
      if (!planoAtivo) {
        toast.success(`Atendimento salvo! Plano semanal de ${semanalData.semanas} semanas criado com sucesso. Vencimentos toda ${diaLabel}.`);
      }
    }
    
    // Se nenhum plano foi criado
    if (!planoAtivo && !semanalAtivo && !pacoteAtivo) {
      toast.success("Atendimento salvo com sucesso!");
    } else if (pacoteAtivo && pacoteData.pacoteDias.length > 0) {
      toast.success(`Atendimento salvo! Pacote de ${pacoteData.dias} dias criado com sucesso.`);
    }
    
    navigate("/");
  };

  return { handleSaveAndFinish };
};
