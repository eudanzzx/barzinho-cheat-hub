import React, { useState, useEffect, useMemo, lazy, Suspense, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTarotAnalises } from "@/hooks/useTarotAnalises";
import { useOptimizedDebounce } from "@/hooks/useOptimizedDebounce";

// Lazy load heavy components
const DashboardHeader = lazy(() => import("@/components/dashboard/DashboardHeader"));
const ClientBirthdayAlert = lazy(() => import("@/components/ClientBirthdayAlert"));
const TarotStatsCards = lazy(() => import("@/components/tarot/TarotStatsCards"));
const AutomaticPaymentNotifications = lazy(() => import("@/components/AutomaticPaymentNotifications"));
const TarotListingHeader = lazy(() => import("@/components/tarot/listing/TarotListingHeader"));
const TarotListingSearch = lazy(() => import("@/components/tarot/listing/TarotListingSearch"));
const TarotListingContent = lazy(() => import("@/components/tarot/listing/TarotListingContent"));
const PaymentDetailsModal = lazy(() => import("@/components/PaymentDetailsModal"));

// Loading fallback component
const LoadingFallback = memo(() => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

const ListagemTarotOptimized = memo(() => {
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

  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useOptimizedDebounce(searchTerm, 300);

  // Memoize filtered results with debounced search
  const filteredTabAnalises = useMemo(() => {
    if (!debouncedSearchTerm) return tabAnalises;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return tabAnalises.filter(analise => 
      analise.nomeCliente?.toLowerCase().includes(searchLower) ||
      analise.clientName?.toLowerCase().includes(searchLower) ||
      analise.pergunta?.toLowerCase().includes(searchLower) ||
      analise.resposta?.toLowerCase().includes(searchLower)
    );
  }, [tabAnalises, debouncedSearchTerm]);

  const counts = useMemo(() => getStatusCounts, [getStatusCounts]);

  // Memoize event handlers
  const handleOpenPaymentDetailsModal = useMemo(() => (event: CustomEvent) => {
    setSelectedPayment(event.detail.payment);
    setIsPaymentModalOpen(true);
  }, []);

  const handleDataCleanup = useMemo(() => () => {
    window.location.reload();
  }, []);

  const handleMarkAsPaid = useMemo(() => (id: string) => {
    const event = new CustomEvent('mark-payment-as-paid', { detail: { id } });
    window.dispatchEvent(event);
    setIsPaymentModalOpen(false);
  }, []);

  const handleDeleteNotification = useMemo(() => (id: string) => {
    const event = new CustomEvent('delete-payment-notification', { detail: { id } });
    window.dispatchEvent(event);
    setIsPaymentModalOpen(false);
  }, []);

  const handleTabChange = useMemo(() => (tab: string) => {
    setActiveTab(tab as 'todas' | 'finalizadas' | 'em-andamento');
  }, [setActiveTab]);

  const handleEditAnalysis = useMemo(() => (id: string) => {
    navigate(`/editar-analise-frequencial/${id}`);
  }, [navigate]);

  // Event listeners with cleanup
  useEffect(() => {
    window.addEventListener('open-payment-details-modal', handleOpenPaymentDetailsModal as EventListener);
    window.addEventListener('payment-notifications-cleared', handleDataCleanup as EventListener);
    
    return () => {
      window.removeEventListener('open-payment-details-modal', handleOpenPaymentDetailsModal as EventListener);
      window.removeEventListener('payment-notifications-cleared', handleDataCleanup as EventListener);
    };
  }, [handleOpenPaymentDetailsModal, handleDataCleanup]);

  // Trigger payment update after mount
  useEffect(() => {
    const triggerPaymentUpdate = () => {
      window.dispatchEvent(new CustomEvent('tarot-payment-updated', {
        detail: { action: 'date_correction', timestamp: Date.now() }
      }));
    };

    const timeoutId = setTimeout(triggerPaymentUpdate, 500);
    return () => clearTimeout(timeoutId);
  }, [analises, tabAnalises]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Suspense fallback={<LoadingFallback />}>
        <DashboardHeader />
      </Suspense>
      
      <Suspense fallback={<div className="h-4" />}>
        <AutomaticPaymentNotifications />
      </Suspense>

      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4">
        {aniversarianteHoje && (
          <Suspense fallback={<LoadingFallback />}>
            <ClientBirthdayAlert
              clientName={aniversarianteHoje.nome}
              birthDate={aniversarianteHoje.dataNascimento}
              context="tarot"
            />
          </Suspense>
        )}

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Suspense fallback={<LoadingFallback />}>
              <TarotListingHeader />
            </Suspense>
          </div>

          <Suspense fallback={<LoadingFallback />}>
            <TarotStatsCards
              totalAnalises={filteredTabAnalises.length}
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
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            <TarotListingSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            <TarotListingContent
              tabAnalises={filteredTabAnalises}
              searchTerm={debouncedSearchTerm}
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              counts={counts}
              onToggleFinished={handleToggleFinished}
              onEdit={handleEditAnalysis}
              onDelete={handleDelete}
            />
          </Suspense>
        </div>
      </main>
      
      <Suspense fallback={<div />}>
        <PaymentDetailsModal
          payment={selectedPayment}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onMarkAsPaid={handleMarkAsPaid}
          onDeleteNotification={handleDeleteNotification}
        />
      </Suspense>
    </div>
  );
});

ListagemTarotOptimized.displayName = 'ListagemTarotOptimized';

export default ListagemTarotOptimized;