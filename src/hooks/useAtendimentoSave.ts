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
    semanalData
  }: SaveAtendimentoParams) => {
    const existingAtendimentos = getAtendimentos();
    
    const novoAtendimento: AtendimentoData = {
      id: Date.now().toString(),
      ...formData,
      statusPagamento: formData.statusPagamento as 'pago' | 'pendente' | 'parcelado',
      signo,
      atencaoFlag: atencao,
      data: formData.dataAtendimento,
      planoAtivo,
      planoData: planoAtivo ? planoData : null,
      semanalAtivo,
      semanalData: semanalAtivo ? semanalData : null,
    };
    
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
    if (!planoAtivo && !semanalAtivo) {
      toast.success("Atendimento salvo com sucesso!");
    }
    
    navigate("/");
  };

  return { handleSaveAndFinish };
};
