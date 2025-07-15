
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Calendar, CreditCard, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import AnalysisHeader from "./TarotAnalysisCard/AnalysisHeader";
import AnalysisActions from "./TarotAnalysisCard/AnalysisActions";
import TarotMonthlyPaymentButton from "./TarotMonthlyPaymentButton";
import TarotWeeklyPaymentButton from "./TarotWeeklyPaymentButton";

const TarotAnalysisCard = React.memo(({
    analise,
    formattedTime,
    timeRemaining,
    onToggleFinished,
    onEdit,
    onDelete
  }: {
    analise: any;
    formattedTime: string | null;
    timeRemaining: any;
    onToggleFinished: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => {
  const isMobile = useIsMobile();
  const { getPlanos, savePlanos } = useUserDataService();
  const [planos, setPlanos] = useState<(PlanoMensal | PlanoSemanal)[]>([]);

  // Otimizar carregamento de planos
  useEffect(() => {
    const loadPlanosForAnalise = () => {
      const allPlanos = getPlanos();
      const filteredPlanos = allPlanos.filter((plano) => 
        (plano.type === 'plano' || plano.type === 'semanal') && 
        plano.analysisId === analise.id
      );
      setPlanos(filteredPlanos);
    };

    loadPlanosForAnalise();

    const handlePlanosUpdated = () => loadPlanosForAnalise();
    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
    };
  }, [analise.id, getPlanos]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  const hasMonthlyPayments = useMemo(() => 
    analise.planoAtivo && analise.planoData && planos.some(p => p.type === 'plano'), 
    [planos, analise.planoAtivo, analise.planoData]
  );

  const hasWeeklyPayments = useMemo(() => 
    analise.semanalAtivo && analise.semanalData && planos.some(p => p.type === 'semanal'), 
    [planos, analise.semanalAtivo, analise.semanalData]
  );

  // Debug logs to check conditions
  console.log('TarotAnalysisCard Debug:', {
    analiseId: analise.id,
    hasMonthlyPayments,
    hasWeeklyPayments,
    planoAtivo: analise.planoAtivo,
    semanalAtivo: analise.semanalAtivo,
    planoData: analise.planoData,
    semanalData: analise.semanalData,
    isMobile,
    planosCount: planos.length
  });

  return (
    <Card className="bg-white/80 border border-[#ede9fe] group">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="flex-1 w-full">
              <AnalysisHeader 
                analise={analise}
                formattedTime={formattedTime}
                timeRemaining={timeRemaining}
              />
            </div>
            {/* Mobile actions - show on mobile */}
            <div className="flex sm:hidden">
              <AnalysisActions
                analise={analise}
                onToggleFinished={onToggleFinished}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
          
          {/* Payment buttons - Show on all devices when conditions are met */}
          <div className="flex flex-wrap gap-2">
            {/* Botão de Pagamentos Mensais */}
            {hasMonthlyPayments && (
              <TarotMonthlyPaymentButton
                analysisId={analise.id}
                clientName={analise.nomeCliente || analise.clientName}
                planoData={analise.planoData}
                startDate={analise.dataAtendimento || analise.created}
              />
            )}

            {/* Botão de Pagamentos Semanais */}
            {hasWeeklyPayments && (
              <TarotWeeklyPaymentButton
                analysisId={analise.id}
                clientName={analise.nomeCliente || analise.clientName}
                semanalData={analise.semanalData}
                startDate={analise.dataAtendimento || analise.created}
              />
            )}
          </div>

          {/* Desktop actions - hidden on mobile */}
          <div className="hidden sm:flex justify-end">
            <AnalysisActions
              analise={analise}
              onToggleFinished={onToggleFinished}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TarotAnalysisCard.displayName = 'TarotAnalysisCard';

export default TarotAnalysisCard;
