
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, FileText, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import IndividualTarotFormGenerator from "@/components/reports/IndividualTarotFormGenerator";
import TarotAnalysisDetails from "./TarotAnalysisDetails";

interface TarotClientCardProps {
  cliente: any;
  expandedClient: string | null;
  setExpandedClient: (client: string | null) => void;
}

const TarotClientCard: React.FC<TarotClientCardProps> = ({
  cliente,
  expandedClient,
  setExpandedClient
}) => {
  const calcularTotalCliente = (analises: any[]) => {
    return analises.reduce((total, analise) => {
      const preco = parseFloat(analise.preco || "150");
      return total + preco;
    }, 0);
  };

  return (
    <div className="border border-white/20 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300 shadow-md">
      <div className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                  {cliente.nome}
                </h3>
                <Badge 
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 border-blue-200 w-fit"
                >
                  {cliente.analises.length} análise{cliente.analises.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium text-emerald-600 truncate">
                    Total: R$ {calcularTotalCliente(cliente.analises).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                  <span className="truncate">
                    Média: R$ {(calcularTotalCliente(cliente.analises) / cliente.analises.length).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpandedClient(expandedClient === cliente.nome ? null : cliente.nome)}
                className="border-purple-600/30 text-purple-600 hover:bg-purple-600/10 text-xs sm:text-sm w-full sm:w-auto"
              >
                {expandedClient === cliente.nome ? 'Ocultar' : 'Ver'} Detalhes
              </Button>
              
              {cliente.analises.length > 1 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span>Gerar Formulário</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-lg">
                    {cliente.analises.map((analise: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50">
                        <IndividualTarotFormGenerator
                          analise={analise}
                          clientName={cliente.nome}
                          className="flex-1 justify-start text-left text-xs"
                        />
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <IndividualTarotFormGenerator
                  analise={cliente.analises[0]}
                  clientName={cliente.nome}
                  className="text-xs sm:text-sm w-full sm:w-auto"
                />
              )}
            </div>
          </div>

          {expandedClient === cliente.nome && (
            <TarotAnalysisDetails cliente={cliente} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TarotClientCard;
