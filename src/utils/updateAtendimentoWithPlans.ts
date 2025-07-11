import useUserDataService from "@/services/userDataService";
import { createPlanoNotifications, createSemanalNotifications } from "@/utils/notificationCreators";

interface UpdateAtendimentoWithPlansParams {
  id: string;
  updatedData: any;
  userDataService: ReturnType<typeof useUserDataService>;
}

export const updateAtendimentoWithPlans = ({
  id,
  updatedData,
  userDataService
}: UpdateAtendimentoWithPlansParams) => {
  const { getAtendimentos, saveAtendimentos, getPlanos, savePlanos } = userDataService;
  
  console.log('updateAtendimentoWithPlans - ID:', id);
  console.log('updateAtendimentoWithPlans - Dados recebidos:', updatedData);
  
  // Get current atendimentos
  const currentAtendimentos = getAtendimentos();
  console.log('updateAtendimentoWithPlans - Atendimentos atuais:', currentAtendimentos.length);
  
  // Find the existing atendimento
  const existingAtendimento = currentAtendimentos.find(atendimento => atendimento.id === id);
  
  if (!existingAtendimento) {
    console.error('updateAtendimentoWithPlans - Atendimento não encontrado com ID:', id);
    return null;
  }
  
  console.log('updateAtendimentoWithPlans - Atendimento existente:', existingAtendimento);
  
  // Create the updated atendimento with all fields preserved
  const updatedAtendimento = {
    ...existingAtendimento,
    ...updatedData,
    id, // Ensure ID is preserved
    dataUltimaEdicao: new Date().toISOString()
  };
  
  console.log('updateAtendimentoWithPlans - Atendimento atualizado:', updatedAtendimento);
  
  // Update the list
  const updatedAtendimentos = currentAtendimentos.map(atendimento => 
    atendimento.id === id ? updatedAtendimento : atendimento
  );
  
  // Save all
  saveAtendimentos(updatedAtendimentos);
  
  // NOVA LÓGICA: Gerenciar notificações de plano
  const allPlanos = getPlanos();
  const clientName = updatedAtendimento.nome;
  
  // Remover TODAS as notificações antigas deste atendimento específico (não do tarot)
  const planosLimpos = allPlanos.filter(plano => {
    const isRelatedById = plano.id.includes(id);
    const isRelatedByClientName = plano.clientName?.toLowerCase().trim() === clientName?.toLowerCase().trim() && !plano.analysisId;
    const isRelatedByPrefix = plano.id.startsWith(`${id}-`) || 
                             plano.id.startsWith(`semanal-${id}`) || 
                             plano.id.startsWith(`plano-${id}`);
    
    const shouldRemove = isRelatedById || isRelatedByClientName || isRelatedByPrefix;
    
    if (shouldRemove) {
      console.log('updateAtendimentoWithPlans - REMOVENDO plano antigo:', {
        planoId: plano.id,
        planoClientName: plano.clientName,
        reason: isRelatedById ? 'ID relacionado' : isRelatedByClientName ? 'Cliente relacionado' : 'Prefixo relacionado'
      });
    }
    
    return !shouldRemove;
  });
  
  console.log('updateAtendimentoWithPlans - Planos após limpeza:', planosLimpos.length);
  
  let finalPlanos = planosLimpos;
  
  // Criar notificações de plano mensal se ativo
  if (updatedAtendimento.planoAtivo && updatedAtendimento.planoData?.meses && updatedAtendimento.planoData?.valorMensal && updatedAtendimento.dataAtendimento) {
    console.log('updateAtendimentoWithPlans - Criando notificações de plano mensal');
    
    const notifications = createPlanoNotifications(
      updatedAtendimento.nome,
      updatedAtendimento.planoData.meses,
      updatedAtendimento.planoData.valorMensal,
      updatedAtendimento.dataAtendimento,
      updatedAtendimento.planoData.diaVencimento || "5"
    );
    
    finalPlanos = [...finalPlanos, ...notifications];
    console.log('updateAtendimentoWithPlans - Adicionadas', notifications.length, 'notificações mensais');
  }
  
  // Criar notificações semanais se ativo
  if (updatedAtendimento.semanalAtivo && updatedAtendimento.semanalData?.semanas && updatedAtendimento.semanalData?.valorSemanal && updatedAtendimento.semanalData?.diaVencimento && updatedAtendimento.dataAtendimento) {
    console.log('updateAtendimentoWithPlans - Criando notificações semanais');
    
    const notifications = createSemanalNotifications(
      updatedAtendimento.nome,
      updatedAtendimento.semanalData.semanas,
      updatedAtendimento.semanalData.valorSemanal,
      updatedAtendimento.dataAtendimento,
      updatedAtendimento.semanalData.diaVencimento
    );
    
    finalPlanos = [...finalPlanos, ...notifications];
    console.log('updateAtendimentoWithPlans - Adicionadas', notifications.length, 'notificações semanais');
  }
  
  // Salvar planos atualizados
  savePlanos(finalPlanos);
  
  // Disparar evento para atualizar as notificações
  window.dispatchEvent(new Event('atendimentosUpdated'));
  window.dispatchEvent(new Event('planosUpdated'));
  
  console.log('updateAtendimentoWithPlans - Dados salvos com sucesso');
  
  return updatedAtendimento;
};