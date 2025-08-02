
import React, { useState, useEffect, useCallback } from 'react';
import useUnifiedDataService from "@/services/unifiedDataService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AutomaticPaymentNotifications from "@/components/AutomaticPaymentNotifications";
import IndexSearchSection from "@/components/dashboard/IndexSearchSection";
import IndexMainContent from "@/components/dashboard/IndexMainContent";
import IndexStats from "@/components/dashboard/IndexStats";
import IndexBirthdaySection from "@/components/dashboard/IndexBirthdaySection";
import OptimizedPaymentDetailsModal from "@/components/optimized/OptimizedPaymentDetailsModal";
import MainPriorityPaymentsModal from "@/components/dashboard/MainPriorityPaymentsModal";
import { useOptimizedIndexStats } from "@/hooks/useOptimizedIndexStats";
import { useIndexFiltering } from "@/hooks/useIndexFiltering";
import { toast } from "sonner";

const Index: React.FC = () => {
  const { getAtendimentos, checkClientBirthday, saveAtendimentos } = useUnifiedDataService();
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState<'semana' | 'mes' | 'ano' | 'total'>('mes');
  const [searchTerm, setSearchTerm] = useState('');
  const [aniversarianteHoje, setAniversarianteHoje] = useState<{ nome: string; dataNascimento: string } | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const filteredAtendimentos = useIndexFiltering(atendimentos, periodoVisualizacao, searchTerm);
  const calculateStats = useOptimizedIndexStats(atendimentos);

  const loadAtendimentos = useCallback(() => {
    const allAtendimentos = getAtendimentos();
    setAtendimentos(allAtendimentos);

    // Verificar aniversariante do dia
    const aniversariante = allAtendimentos.find(atendimento => {
      if (!atendimento.dataNascimento) return false;
      const birthDate = new Date(atendimento.dataNascimento).toISOString().slice(0, 10);
      return checkClientBirthday(birthDate);
    });

    if (aniversariante) {
      setAniversarianteHoje({
        nome: aniversariante.nome,
        dataNascimento: aniversariante.dataNascimento
      });
    } else {
      setAniversarianteHoje(null);
    }
  }, [getAtendimentos, checkClientBirthday]);

  useEffect(() => {
    loadAtendimentos();
  }, [loadAtendimentos]);

  // Escutar evento para abrir modal de detalhes
  useEffect(() => {
    const handleOpenPaymentDetailsModal = (event: CustomEvent) => {
      console.log('Index - Abrindo modal de detalhes para pagamento:', event.detail.payment);
      setSelectedPayment(event.detail.payment);
      setIsPaymentModalOpen(true);
    };

    window.addEventListener('open-payment-details-modal', handleOpenPaymentDetailsModal as EventListener);
    
    return () => {
      window.removeEventListener('open-payment-details-modal', handleOpenPaymentDetailsModal as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleDataUpdated = () => {
      loadAtendimentos();
    };

    window.addEventListener('dataUpdated', handleDataUpdated);
    window.addEventListener('atendimentosUpdated', handleDataUpdated);
    window.addEventListener('planosUpdated', handleDataUpdated);

    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdated);
      window.removeEventListener('atendimentosUpdated', handleDataUpdated);
      window.removeEventListener('planosUpdated', handleDataUpdated);
    };
  }, [loadAtendimentos]);

  const handleDeleteAtendimento = useCallback((id: string) => {
    const updatedAtendimentos = atendimentos.filter(a => a.id !== id);
    saveAtendimentos(updatedAtendimentos);
    toast.success('Atendimento excluído com sucesso!');
    window.dispatchEvent(new CustomEvent('dataUpdated', {
      detail: { type: 'atendimento', action: 'delete', id }
    }));
  }, [atendimentos, saveAtendimentos]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <AutomaticPaymentNotifications />

      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4">
        <IndexBirthdaySection aniversarianteHoje={aniversarianteHoje} />

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dashboard Principal
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie seus atendimentos e acompanhe estatísticas
              </p>
            </div>
          </div>

          <IndexStats 
            calculateStats={calculateStats}
            periodoVisualizacao={periodoVisualizacao}
            setPeriodoVisualizacao={setPeriodoVisualizacao}
          />

          <IndexSearchSection 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <IndexMainContent 
            filteredAtendimentos={filteredAtendimentos}
            searchTerm={searchTerm}
            onDeleteAtendimento={handleDeleteAtendimento}
          />
        </div>
      </main>
      
      <OptimizedPaymentDetailsModal
        payment={selectedPayment}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onMarkAsPaid={(id: string) => {
          window.dispatchEvent(new CustomEvent('mark-payment-as-paid', {
            detail: { id }
          }));
          setIsPaymentModalOpen(false);
        }}
        onDeleteNotification={(id: string) => {
          window.dispatchEvent(new CustomEvent('delete-payment-notification', {
            detail: { id }
          }));
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
};

export default React.memo(Index);
