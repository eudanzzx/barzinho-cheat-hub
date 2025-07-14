
import React, { useState, useEffect } from "react";
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
  const [isPaymentExpanded, setIsPaymentExpanded] = useState(false);

  useEffect(() => {
    loadPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      loadPlanos();
    };

    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
    };
  }, []);

  const loadPlanos = () => {
    const allPlanos = getPlanos();
    console.log('TarotAnalysisCard - loadPlanos:', { 
      analiseId: analise.id, 
      clientName: analise.nome,
      totalPlanos: allPlanos.length 
    });
    
    // CARREGAR TODOS OS PLANOS DE TAROT - MENSAIS E SEMANAIS
    const filteredPlanos = allPlanos.filter((plano) => 
      (plano.type === 'plano' || plano.type === 'semanal') && 
      plano.analysisId === analise.id
    );

    console.log('TarotAnalysisCard - filteredPlanos:', { 
      count: filteredPlanos.length, 
      planos: filteredPlanos,
      mensais: filteredPlanos.filter(p => p.type === 'plano').length,
      semanais: filteredPlanos.filter(p => p.type === 'semanal').length
    });
    
    setPlanos(filteredPlanos);
  };

  const handlePaymentToggle = (planoId: string, clientName: string, isPaid: boolean) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === planoId ? { ...plano, active: !isPaid } : plano
    );
    
    savePlanos(updatedPlanos);
    toast.success(
      isPaid 
        ? `Pagamento de ${clientName} marcado como pago!`
        : `Pagamento de ${clientName} marcado como pendente!`
    );
    
    window.dispatchEvent(new Event('atendimentosUpdated'));
    loadPlanos();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const hasMonthlyPayments = planos.length > 0;

  const togglePaymentExpansion = () => {
    console.log('TarotAnalysisCard - togglePaymentExpansion:', { 
      current: isPaymentExpanded, 
      planos: planos.length,
      analise: analise.nome 
    });
    setIsPaymentExpanded(prev => !prev);
  };

  return (
    <>
      <Card
        className="bg-white/80 border border-[#ede9fe] animate-fade-in group"
      >
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AnalysisHeader 
                  analise={analise}
                  formattedTime={formattedTime}
                  timeRemaining={timeRemaining}
                />
                {isMobile && hasMonthlyPayments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('TarotAnalysisCard - Button clicked:', { isMobile, hasMonthlyPayments, planos: planos.length });
                      togglePaymentExpansion();
                    }}
                    className="p-1 h-auto ml-1"
                  >
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <Badge 
                        variant="secondary" 
                        className="bg-purple-600/10 text-purple-600 border-purple-600/20 text-xs px-1.5 py-0.5"
                      >
                        {planos.length}
                      </Badge>
                      <ChevronDown className={cn(
                        "h-4 w-4 text-purple-600 transition-transform duration-300",
                        isPaymentExpanded && "rotate-180"
                      )} />
                    </div>
                  </Button>
                )}
              </div>
            </div>
            <AnalysisActions
              analise={analise}
              onToggleFinished={onToggleFinished}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </CardContent>
      </Card>

      {hasMonthlyPayments && isMobile && (
        <div className="mt-2">
          <Collapsible open={isPaymentExpanded} onOpenChange={(open) => {
            console.log('TarotAnalysisCard - Collapsible onOpenChange:', { open, analise: analise.nome });
            setIsPaymentExpanded(open);
          }}>
            <CollapsibleContent className="animate-accordion-down">
              <Card className="border-purple-200 mb-4 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Pagamentos Tarot</span>
                    <Badge 
                      variant="secondary" 
                      className="bg-purple-100 text-purple-800"
                    >
                      {planos.filter(p => !p.active).length}/{planos.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                  {planos.map((plano) => {
                    const isPaid = !plano.active;
                    const isWeekly = plano.type === 'semanal';
                    return (
                      <Button
                        key={plano.id}
                        onClick={() => handlePaymentToggle(plano.id, analise.nome, !isPaid)}
                        variant="outline"
                        className={`
                          w-full p-4 h-auto flex items-center justify-between
                          ${isPaid 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-red-50 border-red-200 text-red-800'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded-full ${isPaid ? 'bg-green-200' : 'bg-red-200'}`}>
                            {isPaid ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">
                              {isWeekly 
                                ? `${(plano as PlanoSemanal).week}ª Semana` 
                                : `${(plano as PlanoMensal).month}º Mês`
                              }
                            </div>
                            <div className="text-sm opacity-75">
                              Vencimento: {formatDate(plano.dueDate)}
                            </div>
                          </div>
                        </div>
                        <Badge variant={isPaid ? "default" : "destructive"}>
                          {isPaid ? 'Pago' : 'Pendente'}
                        </Badge>
                      </Button>
                    );
                  })}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </>
  );
});

TarotAnalysisCard.displayName = 'TarotAnalysisCard';

export default TarotAnalysisCard;
