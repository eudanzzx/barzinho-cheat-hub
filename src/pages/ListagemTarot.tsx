
import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import TarotStatsCards from "@/components/tarot/TarotStatsCards";
import AutomaticPaymentNotifications from "@/components/AutomaticPaymentNotifications";
import TarotListingHeader from "@/components/tarot/listing/TarotListingHeader";
import TarotListingSearch from "@/components/tarot/listing/TarotListingSearch";
import OptimizedPaymentDetailsModal from "@/components/optimized/OptimizedPaymentDetailsModal";
import { useNavigate } from "react-router-dom";
import { useTarotAnalises } from "@/hooks/useTarotAnalises";
import TarotMegaOptimized from "@/components/tarot/TarotMegaOptimized";

const ListagemTarot = React.memo(() => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const {
    analises,
    tabAnalises,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    selectedPeriod,
    handlePeriodChange,
    aniversarianteHoje,
    recebidoStats,
    getStatusCounts,
    handleDelete,
    handleToggleFinished,
  } = useTarotAnalises();

  const counts = useMemo(() => getStatusCounts, [getStatusCounts]);

  const handleOpenModal = useCallback((event: CustomEvent) => {
    setSelectedPayment(event.detail.payment);
    setIsPaymentModalOpen(true);
  }, []);

  const handleDataCleanup = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    window.addEventListener('open-payment-details-modal', handleOpenModal as EventListener);
    window.addEventListener('payment-notifications-cleared', handleDataCleanup as EventListener);
    
    return () => {
      window.removeEventListener('open-payment-details-modal', handleOpenModal as EventListener);
      window.removeEventListener('payment-notifications-cleared', handleDataCleanup as EventListener);
    };
  }, [handleOpenModal, handleDataCleanup]);

  const handleEdit = useCallback((id: string) => {
    navigate(`/editar-analise-frequencial/${id}`);
  }, [navigate]);

  const handleMarkAsPaid = useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent('mark-payment-as-paid', { detail: { id } }));
    setIsPaymentModalOpen(false);
  }, []);

  const handleDeleteNotification = useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent('delete-payment-notification', { detail: { id } }));
    setIsPaymentModalOpen(false);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as 'todas' | 'finalizadas' | 'em-andamento');
  }, [setActiveTab]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <AutomaticPaymentNotifications />

      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4">
        {aniversarianteHoje && (
          <ClientBirthdayAlert
            clientName={aniversarianteHoje.nome}
            birthDate={aniversarianteHoje.dataNascimento}
            context="tarot"
          />
        )}

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Análises de Tarot
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie suas análises e acompanhe estatísticas
              </p>
            </div>
          </div>

          <TarotStatsCards
            totalAnalises={tabAnalises.length}
            totalRecebido={recebidoStats.total}
            totalRecebidoSemana={recebidoStats.semana}
            totalRecebidoMes={recebidoStats.mes}
            totalRecebidoAno={recebidoStats.ano}
            finalizados={counts.finalizados}
            lembretes={0}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            variant="tarot"
          />

          <TarotListingSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <TarotMegaOptimized
            analises={tabAnalises}
            searchTerm={searchTerm}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            counts={counts}
            onToggleFinished={handleToggleFinished}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>
      
      <OptimizedPaymentDetailsModal
        payment={selectedPayment}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onMarkAsPaid={handleMarkAsPaid}
        onDeleteNotification={handleDeleteNotification}
      />
    </div>
  );
});

ListagemTarot.displayName = 'ListagemTarot';

export default ListagemTarot;
