
import React from "react";
import { Calendar, DollarSign, Sparkles, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateString } from "@/utils/dateFormatter";

interface AnalysisHeaderProps {
  analise: any;
  formattedTime: string | null;
  timeRemaining: any;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  analise,
  formattedTime,
  timeRemaining,
}) => {
  console.log('AnalysisHeader - Dados da análise:', {
    nomeCliente: analise.nomeCliente,
    planoAtivo: analise.planoAtivo,
    planoData: analise.planoData,
    semanalAtivo: analise.semanalAtivo,
    semanalData: analise.semanalData
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-[#32204a] group-hover:text-[#673193] transition-colors duration-300 flex items-center gap-2 truncate">
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
      
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#41226e] mt-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#673193]" />
          <span>
            {formatDateString(analise.dataInicio || '')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-600" />
          <span className="font-medium text-emerald-600">
            R$ {parseFloat(analise.preco || "0").toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>{analise.signo || 'Signo não informado'}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisHeader;
