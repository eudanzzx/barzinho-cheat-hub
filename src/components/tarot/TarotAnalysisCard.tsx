
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
    if (!dateString) return '';
    
    // Se já está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Para outros formatos, tenta conversão normal
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  // Simplificar as condições - verificar apenas se os dados estão presentes
  const hasMonthlyPayments = useMemo(() => 
    Boolean(analise.planoAtivo && analise.planoData && analise.planoData.meses && analise.planoData.valorMensal), 
    [analise.planoAtivo, analise.planoData]
  );

  const hasWeeklyPayments = useMemo(() => 
    Boolean(analise.semanalAtivo && analise.semanalData && analise.semanalData.semanas && analise.semanalData.valorSemanal), 
    [analise.semanalAtivo, analise.semanalData]
  );

  // Debug logs mais detalhados
  console.log('🔍 TarotAnalysisCard - Condições detalhadas:', {
    analiseId: analise.id,
    clientName: analise.nomeCliente || analise.clientName,
    
    // Dados mensais
    planoAtivo: analise.planoAtivo,
    planoData: analise.planoData,
    planoDataMeses: analise.planoData?.meses,
    planoDataValor: analise.planoData?.valorMensal,
    hasMonthlyPayments,
    
    // Dados semanais  
    semanalAtivo: analise.semanalAtivo,
    semanalData: analise.semanalData,
    semanalDataSemanas: analise.semanalData?.semanas,
    semanalDataValor: analise.semanalData?.valorSemanal,
    hasWeeklyPayments,
    
    // Estado geral
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
          
          {/* Payment buttons - FORÇAR EXIBIÇÃO PARA TESTE */}
          <div className="flex flex-col gap-2 w-full">
            {/* Botão de Pagamentos Mensais */}
            {hasMonthlyPayments && (
              <div className="w-full">
                <TarotMonthlyPaymentButton
                  analysisId={analise.id}
                  clientName={analise.nomeCliente || analise.clientName}
                  planoData={analise.planoData}
                  startDate={analise.dataAtendimento || analise.created}
                />
              </div>
            )}

            {/* Botão de Pagamentos Semanais */}
            {hasWeeklyPayments && (
              <div className="w-full">
                <TarotWeeklyPaymentButton
                  analysisId={analise.id}
                  clientName={analise.nomeCliente || analise.clientName}
                  semanalData={analise.semanalData}
                  startDate={analise.dataAtendimento || analise.created}
                />
              </div>
            )}

            {/* DEBUG: Mostrar sempre os botões para teste */}
            {!hasMonthlyPayments && !hasWeeklyPayments && (
              <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded">
                Debug: Sem pagamentos ativos
                <br />
                Mensal: {analise.planoAtivo ? '✓' : '✗'} | Dados: {analise.planoData ? '✓' : '✗'}
                <br />
                Semanal: {analise.semanalAtivo ? '✓' : '✗'} | Dados: {analise.semanalData ? '✓' : '✗'}
              </div>
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
