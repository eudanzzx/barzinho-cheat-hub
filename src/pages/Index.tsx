
import React, { useState, useEffect, useCallback } from 'react';
import useOptimizedUserDataService from "@/services/optimizedUserDataService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AutomaticPaymentNotifications from "@/components/AutomaticPaymentNotifications";
import IndexSearchSection from "@/components/dashboard/IndexSearchSection";
import IndexMainContent from "@/components/dashboard/IndexMainContent";
import IndexStats from "@/components/dashboard/IndexStats";
import IndexBirthdaySection from "@/components/dashboard/IndexBirthdaySection";
import PaymentDetailsModal from "@/components/PaymentDetailsModal";
import MainPriorityPaymentsModal from "@/components/dashboard/MainPriorityPaymentsModal";
import { useIndexStats } from "@/hooks/useIndexStats";
import { useIndexFiltering } from "@/hooks/useIndexFiltering";
import { toast } from "sonner";

const Index: React.FC = React.memo(() => {
  const { getAtendimentos, checkClientBirthday, saveAtendimentos } = useOptimizedUserDataService();
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [periodoVisualizacao, setPeriodoVisualizacao] = useState<'semana' | 'mes' | 'ano' | 'total'>('mes');
  const [searchTerm, setSearchTerm] = useState('');
  const [aniversarianteHoje, setAniversarianteHoje] = useState<{ nome: string; dataNascimento: string } | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const filteredAtendimentos = useIndexFiltering(atendimentos, periodoVisualizacao, searchTerm);
  const calculateStats = useIndexStats(atendimentos);

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

    window.addEventListener('atendimentosUpdated', handleDataUpdated);
    window.addEventListener('planosUpdated', handleDataUpdated);

    return () => {
      window.removeEventListener('atendimentosUpdated', handleDataUpdated);
      window.removeEventListener('planosUpdated', handleDataUpdated);
    };
  }, [loadAtendimentos]);

  const handleDeleteAtendimento = (id: string) => {
    const updatedAtendimentos = atendimentos.filter(a => a.id !== id);
    saveAtendimentos(updatedAtendimentos);
    toast.success('Atendimento excluído com sucesso!');
    window.dispatchEvent(new Event('atendimentosUpdated'));
  };

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
            <div className="flex gap-2">
              <MainPriorityPaymentsModal atendimentos={atendimentos} />
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
      
      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onMarkAsPaid={(id: string) => {
          // Disparar evento para marcar como pago
          const event = new CustomEvent('mark-payment-as-paid', {
            detail: { id }
          });
          window.dispatchEvent(event);
          setIsPaymentModalOpen(false);
        }}
        onDeleteNotification={(id: string) => {
          // Disparar evento para excluir notificação
          const event = new CustomEvent('delete-payment-notification', {
            detail: { id }
          });
          window.dispatchEvent(event);
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
