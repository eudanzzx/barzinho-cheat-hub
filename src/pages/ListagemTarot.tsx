
import React, { useState, useEffect, useMemo } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import TarotStatsCards from "@/components/tarot/TarotStatsCards";
import AutomaticPaymentNotifications from "@/components/AutomaticPaymentNotifications";
import TarotListingHeader from "@/components/tarot/listing/TarotListingHeader";
import TarotListingSearch from "@/components/tarot/listing/TarotListingSearch";
import TarotListingContent from "@/components/tarot/listing/TarotListingContent";
import PaymentDetailsModal from "@/components/PaymentDetailsModal";
import DataCleanupButton from "@/components/DataCleanupButton";
import { useNavigate } from "react-router-dom";
import { useTarotAnalises } from "@/hooks/useTarotAnalises";

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

  console.log('ListagemTarot - Renderizada com:', {
    analisesCount: analises?.length || 0,
    tabAnalisesCount: tabAnalises?.length || 0,
    activeTab,
    searchTerm
  });

  // Escutar evento para abrir modal de detalhes
  useEffect(() => {
    const handleOpenPaymentDetailsModal = (event: CustomEvent) => {
      console.log('ListagemTarot - Abrindo modal de detalhes para pagamento:', event.detail.payment);
      setSelectedPayment(event.detail.payment);
      setIsPaymentModalOpen(true);
    };

    const handleDataCleanup = () => {
      console.log('ListagemTarot - Dados limpos, recarregando componente');
      // Forçar atualização do componente
      window.location.reload();
    };

    window.addEventListener('open-payment-details-modal', handleOpenPaymentDetailsModal as EventListener);
    window.addEventListener('payment-notifications-cleared', handleDataCleanup as EventListener);
    
    return () => {
      window.removeEventListener('open-payment-details-modal', handleOpenPaymentDetailsModal as EventListener);
      window.removeEventListener('payment-notifications-cleared', handleDataCleanup as EventListener);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'todas' | 'finalizadas' | 'em-andamento');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TarotListingHeader />
            <DataCleanupButton />
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

          <TarotListingContent
            tabAnalises={tabAnalises}
            searchTerm={searchTerm}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            counts={counts}
            onToggleFinished={handleToggleFinished}
            onEdit={(id) => navigate(`/editar-analise-frequencial/${id}`)}
            onDelete={handleDelete}
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

ListagemTarot.displayName = 'ListagemTarot';

export default ListagemTarot;
