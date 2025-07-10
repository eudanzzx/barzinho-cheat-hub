
import useUserDataService from "@/services/userDataService";

// Function to save a new atendimento
export const saveNewAtendimento = (atendimento: any, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getAtendimentos, saveAtendimentos } = userDataService;
  
  // Get current atendimentos
  const currentAtendimentos = getAtendimentos();
  
  // Add the new one
  const updatedAtendimentos = [...currentAtendimentos, atendimento];
  
  // Save all
  saveAtendimentos(updatedAtendimentos);
  
  return atendimento;
};

// Function to update an existing atendimento
export const updateAtendimento = (id: string, updatedData: any, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getAtendimentos, saveAtendimentos } = userDataService;
  
  console.log('updateAtendimento - ID:', id);
  console.log('updateAtendimento - Dados recebidos:', updatedData);
  
  // Get current atendimentos
  const currentAtendimentos = getAtendimentos();
  console.log('updateAtendimento - Atendimentos atuais:', currentAtendimentos.length);
  
  // Find the existing atendimento
  const existingAtendimento = currentAtendimentos.find(atendimento => atendimento.id === id);
  
  if (!existingAtendimento) {
    console.error('updateAtendimento - Atendimento não encontrado com ID:', id);
    return null;
  }
  
  console.log('updateAtendimento - Atendimento existente:', existingAtendimento);
  
  // Create the updated atendimento with all fields preserved
  const updatedAtendimento = {
    ...existingAtendimento,
    ...updatedData,
    id, // Ensure ID is preserved
    dataUltimaEdicao: new Date().toISOString()
  };
  
  console.log('updateAtendimento - Atendimento atualizado:', updatedAtendimento);
  
  // Update the list
  const updatedAtendimentos = currentAtendimentos.map(atendimento => 
    atendimento.id === id ? updatedAtendimento : atendimento
  );
  
  console.log('updateAtendimento - Lista final:', updatedAtendimentos);
  
  // Save all
  saveAtendimentos(updatedAtendimentos);
  
  // Disparar evento para atualizar as notificações
  window.dispatchEvent(new Event('atendimentosUpdated'));
  window.dispatchEvent(new Event('planosUpdated'));
  
  console.log('updateAtendimento - Dados salvos com sucesso');
  
  return updatedAtendimento;
};

// Function to delete an atendimento and its related notifications
export const deleteAtendimento = (id: string, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getAtendimentos, saveAtendimentos, getPlanos, savePlanos } = userDataService;
  
  console.log('deleteAtendimento - INICIANDO EXCLUSÃO - ID:', id);
  
  // Get current atendimentos
  const currentAtendimentos = getAtendimentos();
  
  // Find the atendimento to get the client name before deleting
  const atendimentoToDelete = currentAtendimentos.find(atendimento => atendimento.id === id);
  
  if (!atendimentoToDelete) {
    console.error('deleteAtendimento - Atendimento não encontrado para exclusão:', id);
    return false;
  }
  
  const clientName = atendimentoToDelete.nome;
  console.log('deleteAtendimento - Deletando atendimento do cliente:', clientName);
  
  // Remove the atendimento
  const updatedAtendimentos = currentAtendimentos.filter(atendimento => atendimento.id !== id);
  
  // Save updated atendimentos IMEDIATAMENTE
  saveAtendimentos(updatedAtendimentos);
  console.log('deleteAtendimento - Atendimento removido. Restam:', updatedAtendimentos.length);
  
  // Get current planos/notifications
  const currentPlanos = getPlanos();
  console.log('deleteAtendimento - Planos antes da limpeza:', currentPlanos.length);
  
  // Remove related notifications de forma mais agressiva
  const updatedPlanos = currentPlanos.filter(plano => {
    // Normalizar nomes para comparação
    const planoClientName = plano.clientName?.toLowerCase().trim();
    const targetClientName = clientName?.toLowerCase().trim();
    
    // Verificar múltiplas condições para remoção
    const isRelatedById = plano.id.includes(id);
    const isRelatedByClientName = planoClientName === targetClientName && !plano.analysisId;
    const isRelatedByPrefix = plano.id.startsWith(`${id}-`) || 
                              plano.id.startsWith(`semanal-${id}`) || 
                              plano.id.startsWith(`plano-${id}`);
    
    const shouldRemove = isRelatedById || isRelatedByClientName || isRelatedByPrefix;
    
    if (shouldRemove) {
      console.log('deleteAtendimento - REMOVENDO plano relacionado:', {
        planoId: plano.id,
        planoClientName: plano.clientName,
        targetClientName: clientName,
        analysisId: plano.analysisId,
        type: plano.type,
        reason: isRelatedById ? 'ID relacionado' : isRelatedByClientName ? 'Cliente relacionado' : 'Prefixo relacionado'
      });
    }
    
    return !shouldRemove;
  });
  
  console.log('deleteAtendimento - Planos após limpeza:', updatedPlanos.length);
  console.log('deleteAtendimento - Planos removidos:', currentPlanos.length - updatedPlanos.length);
  
  // Save updated planos IMEDIATAMENTE
  savePlanos(updatedPlanos);
  
  // Função robusta para disparar eventos múltiplas vezes
  const triggerSyncEvents = () => {
    console.log('deleteAtendimento - Disparando eventos de sincronização...');
    
    // Array de eventos para disparar
    const events = [
      'atendimentosUpdated',
      'planosUpdated', 
      'atendimentoDeleted'
    ];
    
    // Disparar eventos customizados
    events.forEach(eventName => {
      const event = new CustomEvent(eventName, { 
        detail: { deletedId: id, clientName: clientName }
      });
      window.dispatchEvent(event);
      console.log('deleteAtendimento - Evento disparado:', eventName);
    });
    
    // Disparar eventos de storage para garantir sincronização
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'atendimentos',
      newValue: JSON.stringify(updatedAtendimentos),
      oldValue: JSON.stringify(currentAtendimentos)
    }));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'planos',
      newValue: JSON.stringify(updatedPlanos),
      oldValue: JSON.stringify(currentPlanos)
    }));
    
    console.log('deleteAtendimento - Todos os eventos disparados');
  };
  
  // Disparar eventos múltiplas vezes para garantir
  triggerSyncEvents(); // Imediato
  setTimeout(triggerSyncEvents, 10); // 10ms
  setTimeout(triggerSyncEvents, 50); // 50ms
  setTimeout(triggerSyncEvents, 100); // 100ms
  setTimeout(triggerSyncEvents, 200); // 200ms
  
  console.log('deleteAtendimento - EXCLUSÃO COMPLETA - ID:', id);
  
  return true;
};

// Function to save a new tarot analysis
export const saveNewTarotAnalysis = (analysis: any, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getTarotAnalyses, saveTarotAnalyses } = userDataService;
  
  // Get current analyses
  const currentAnalyses = getTarotAnalyses();
  
  // Add the new one
  const updatedAnalyses = [...currentAnalyses, analysis];
  
  // Save all
  saveTarotAnalyses(updatedAnalyses);
  
  // Disparar evento para sincronização
  window.dispatchEvent(new Event('tarotAnalysesUpdated'));
  
  return analysis;
};

// Function to update an existing tarot analysis
export const updateTarotAnalysis = (id: string, updatedAnalysis: any, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getTarotAnalyses, saveTarotAnalyses } = userDataService;
  
  // Get current analyses
  const currentAnalyses = getTarotAnalyses();
  
  // Find and update the specific one
  const updatedAnalyses = currentAnalyses.map(analysis => 
    analysis.id === id ? { 
      ...analysis, 
      ...updatedAnalysis, 
      dataAtualizacao: new Date().toISOString() 
    } : analysis
  );
  
  // Save all
  saveTarotAnalyses(updatedAnalyses);
  
  // Disparar evento para sincronização
  window.dispatchEvent(new Event('tarotAnalysesUpdated'));
  
  return updatedAnalysis;
};

// Function to delete a tarot analysis and its related notifications
export const deleteTarotAnalysis = (id: string, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getTarotAnalyses, saveTarotAnalyses, getPlanos, savePlanos } = userDataService;
  
  console.log('deleteTarotAnalysis - INICIANDO EXCLUSÃO - ID:', id);
  
  // Get current analyses
  const currentAnalyses = getTarotAnalyses();
  
  // Find the analysis to get the client name before deleting
  const analysisToDelete = currentAnalyses.find(analysis => analysis.id === id);
  
  if (!analysisToDelete) {
    console.error('deleteTarotAnalysis - Análise não encontrada para exclusão:', id);
    return false;
  }
  
  const clientName = analysisToDelete.clientName;
  console.log('deleteTarotAnalysis - Deletando análise do cliente:', clientName);
  
  // Remove the analysis
  const updatedAnalyses = currentAnalyses.filter(analysis => analysis.id !== id);
  
  // Save updated analyses IMEDIATAMENTE
  saveTarotAnalyses(updatedAnalyses);
  console.log('deleteTarotAnalysis - Análise removida. Restam:', updatedAnalyses.length);
  
  // Get current planos/notifications
  const currentPlanos = getPlanos();
  console.log('deleteTarotAnalysis - Planos antes da limpeza:', currentPlanos.length);
  
  // Remove related notifications de forma mais agressiva
  const updatedPlanos = currentPlanos.filter(plano => {
    // Normalizar nomes para comparação
    const planoClientName = plano.clientName?.toLowerCase().trim();
    const targetClientName = clientName?.toLowerCase().trim();
    
    // Verificar múltiplas condições para remoção
    const isRelatedById = plano.id.includes(id);
    const isRelatedByAnalysisId = plano.analysisId === id;
    const isRelatedByClientName = planoClientName === targetClientName && plano.analysisId;
    const isRelatedByPrefix = plano.id.startsWith(`${id}-`) || 
                              plano.id.includes(`-${id}-`) ||
                              plano.id.endsWith(`-${id}`);
    
    const shouldRemove = isRelatedById || isRelatedByAnalysisId || isRelatedByClientName || isRelatedByPrefix;
    
    if (shouldRemove) {
      console.log('deleteTarotAnalysis - REMOVENDO plano relacionado:', {
        planoId: plano.id,
        planoClientName: plano.clientName,
        targetClientName: clientName,
        analysisId: plano.analysisId,
        type: plano.type,
        reason: isRelatedById ? 'ID relacionado' : 
                isRelatedByAnalysisId ? 'Analysis ID relacionado' :
                isRelatedByClientName ? 'Cliente relacionado' : 'Prefixo relacionado'
      });
    }
    
    return !shouldRemove;
  });
  
  console.log('deleteTarotAnalysis - Planos após limpeza:', updatedPlanos.length);
  console.log('deleteTarotAnalysis - Planos removidos:', currentPlanos.length - updatedPlanos.length);
  
  // Save updated planos IMEDIATAMENTE
  savePlanos(updatedPlanos);
  
  // Função robusta para disparar eventos múltiplas vezes
  const triggerSyncEvents = () => {
    console.log('deleteTarotAnalysis - Disparando eventos de sincronização...');
    
    // Array de eventos para disparar
    const events = [
      'tarotAnalysesUpdated',
      'planosUpdated',
      'tarotAnalysisDeleted'
    ];
    
    // Disparar eventos customizados
    events.forEach(eventName => {
      const event = new CustomEvent(eventName, { 
        detail: { deletedId: id, clientName: clientName }
      });
      window.dispatchEvent(event);
      console.log('deleteTarotAnalysis - Evento disparado:', eventName);
    });
    
    // Disparar eventos de storage para garantir sincronização
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'analises',
      newValue: JSON.stringify(updatedAnalyses),
      oldValue: JSON.stringify(currentAnalyses)
    }));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'planos',
      newValue: JSON.stringify(updatedPlanos),
      oldValue: JSON.stringify(currentPlanos)
    }));
    
    console.log('deleteTarotAnalysis - Todos os eventos disparados');
  };
  
  // Disparar eventos múltiplas vezes para garantir
  triggerSyncEvents(); // Imediato
  setTimeout(triggerSyncEvents, 10); // 10ms
  setTimeout(triggerSyncEvents, 50); // 50ms
  setTimeout(triggerSyncEvents, 100); // 100ms
  setTimeout(triggerSyncEvents, 200); // 200ms
  
  console.log('deleteTarotAnalysis - EXCLUSÃO COMPLETA - ID:', id);
  
  return true;
};

// Function to update localStorage for analyses (fallback)
export const updateAnalysisInLocalStorage = (id: string, updatedData: any) => {
  try {
    const analises = JSON.parse(localStorage.getItem("analises") || "[]");
    const updatedAnalises = analises.map((analise: any) => 
      analise.id === id ? { 
        ...analise, 
        ...updatedData, 
        dataAtualizacao: new Date().toISOString() 
      } : analise
    );
    localStorage.setItem("analises", JSON.stringify(updatedAnalises));
    
    // Disparar evento para sincronização
    window.dispatchEvent(new Event('tarotAnalysesUpdated'));
    
    return true;
  } catch (error) {
    console.error("Erro ao atualizar análise no localStorage:", error);
    return false;
  }
};
