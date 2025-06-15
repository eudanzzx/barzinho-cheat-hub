
import React from "react";
import { 
  Calendar, 
  DollarSign, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Check, 
  X, 
  Edit3, 
  Trash2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import PlanoPaymentButton from "@/components/tarot/PlanoPaymentButton";
import SemanalPaymentButton from "@/components/tarot/SemanalPaymentButton";
import { useNavigate } from "react-router-dom";

// Otimize ao máximo este card - só renderiza se props mudarem!
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
  
  console.log('TarotAnalysisCard - analise:', analise);
  console.log('TarotAnalysisCard - planoAtivo:', analise.planoAtivo);
  console.log('TarotAnalysisCard - semanalAtivo:', analise.semanalAtivo);
  console.log('TarotAnalysisCard - planoData:', analise.planoData);
  console.log('TarotAnalysisCard - semanalData:', analise.semanalData);

  return (
    <div key={analise.id} className="space-y-3">
      <Card 
        className="bg-white/80 border border-[#ede9fe] hover:bg-white/90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] animate-fade-in group"
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-[#32204a] group-hover:text-[#673193] transition-colors duration-300 flex items-center gap-2">
                  {analise.nomeCliente}
                  {formattedTime && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs flex items-center gap-1 ${
                        timeRemaining?.days === 0 
                          ? "border-red-300 text-red-600 bg-red-50" 
                          : timeRemaining?.days === 1
                          ? "border-amber-300 text-amber-600 bg-amber-50"
                          : "border-[#bda3f2] text-[#673193] bg-[#ede9fe]/50"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {formattedTime}
                    </Badge>
                  )}
                </h3>
                {analise.atencaoFlag && (
                  <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
                )}
                <Badge 
                  variant={analise.finalizado ? "default" : "secondary"}
                  className={`${
                    analise.finalizado 
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" 
                      : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                  } transition-all duration-300`}
                >
                  {analise.finalizado ? "Finalizada" : "Em andamento"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#41226e]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#673193]" />
                  <span>
                    {analise.dataInicio 
                      ? new Date(analise.dataInicio).toLocaleDateString('pt-BR')
                      : 'Data não informada'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-emerald-600">
                    R$ {parseFloat(analise.preco || "150").toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>{analise.signo || 'Signo não informado'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-0 md:ml-4">
              <Button
                size="sm"
                variant={analise.finalizado ? "outline" : "default"}
                className={
                  analise.finalizado
                    ? "border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    : "bg-tarot-primary text-white border-tarot-primary hover:bg-tarot-primary"
                }
                onClick={() => onToggleFinished(analise.id)}
              >
                {analise.finalizado ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#ede9fe] text-tarot-primary hover:bg-[#ede9fe]"
                onClick={() => onEdit(analise.id)}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white/98 backdrop-blur-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir a análise de <strong>{analise.nomeCliente}</strong>? 
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="hover:bg-slate-100 transition-colors duration-300">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(analise.id)}
                      className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Botões de Pagamento - sempre exibir se os planos estão ativos */}
      <div className="space-y-2">
        {analise.planoAtivo && analise.planoData && (
          <PlanoPaymentButton
            analysisId={analise.id}
            clientName={analise.nomeCliente}
            planoData={analise.planoData}
            startDate={analise.dataInicio || analise.dataAtendimento || new Date().toISOString().split('T')[0]}
          />
        )}
        {analise.semanalAtivo && analise.semanalData && (
          <SemanalPaymentButton
            analysisId={analise.id}
            clientName={analise.nomeCliente}
            semanalData={analise.semanalData}
            startDate={analise.dataInicio || analise.dataAtendimento || new Date().toISOString().split('T')[0]}
          />
        )}
      </div>
    </div>
  );
});

export default TarotAnalysisCard;
