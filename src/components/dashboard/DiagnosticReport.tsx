
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bug, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import useUserDataService from "@/services/userDataService";

const DiagnosticReport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getPlanos, getAtendimentos } = useUserDataService();

  const generateReport = () => {
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    
    console.log("=== DIAGNOSTIC REPORT ===");
    console.log("Total atendimentos:", atendimentos.length);
    console.log("Atendimentos:", atendimentos);
    console.log("Total planos:", allPlanos.length);
    console.log("Todos os planos:", allPlanos);
    
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    console.log("Nomes de clientes existentes:", Array.from(existingClientNames));
    
    const monthlyPlanos = allPlanos.filter(plano => plano.type === 'plano');
    const weeklyPlanos = allPlanos.filter(plano => plano.type === 'semanal');
    
    console.log("Planos mensais total:", monthlyPlanos.length);
    console.log("Planos semanais total:", weeklyPlanos.length);
    
    const activeMonthlyPlanos = allPlanos.filter(plano => 
      plano.type === 'plano' && 
      plano.active && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );
    
    const activeWeeklyPlanos = allPlanos.filter(plano => 
      plano.type === 'semanal' && 
      plano.active && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );
    
    console.log("Planos mensais ativos e válidos:", activeMonthlyPlanos.length);
    console.log("Planos semanais ativos e válidos:", activeWeeklyPlanos.length);
    console.log("=== FIM DO REPORT ===");
    
    return {
      totalAtendimentos: atendimentos.length,
      totalPlanos: allPlanos.length,
      planosAtivosValidos: {
        mensal: activeMonthlyPlanos.length,
        semanal: activeWeeklyPlanos.length
      },
      clientesExistentes: Array.from(existingClientNames),
      allPlanos,
      activeMonthlyPlanos,
      activeWeeklyPlanos
    };
  };

  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = () => {
    const data = generateReport();
    setReportData(data);
  };

  return (
    <div className="mt-4">
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-300 border-2",
          isOpen 
            ? "border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg" 
            : "border-orange-200 bg-white hover:border-orange-300 hover:shadow-md"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-orange-700">
              <div className="p-2 rounded-full bg-orange-100">
                <Bug className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Diagnóstico do Sistema</h3>
                <p className="text-sm text-orange-600 font-normal">
                  Verificar dados e funcionamento
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="bg-orange-100 text-orange-800 border-orange-200"
              >
                Debug
              </Badge>
              <ChevronDown className={cn(
                "h-5 w-5 text-orange-600 transition-transform duration-300",
                isOpen && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        
        {isOpen && (
          <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4 mt-4">
              <Button 
                onClick={handleGenerateReport}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Info className="h-4 w-4 mr-2" />
                Gerar Relatório de Diagnóstico
              </Button>
              
              {reportData && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-gray-800">Resultado do Diagnóstico:</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Atendimentos:</span>
                      <span className="ml-2 text-blue-600">{reportData.totalAtendimentos}</span>
                    </div>
                    <div>
                      <span className="font-medium">Total Planos:</span>
                      <span className="ml-2 text-green-600">{reportData.totalPlanos}</span>
                    </div>
                    <div>
                      <span className="font-medium">Planos Mensais Ativos:</span>
                      <span className="ml-2 text-purple-600">{reportData.planosAtivosValidos.mensal}</span>
                    </div>
                    <div>
                      <span className="font-medium">Planos Semanais Ativos:</span>
                      <span className="ml-2 text-emerald-600">{reportData.planosAtivosValidos.semanal}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm">Clientes Existentes:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {reportData.clientesExistentes.map((nome: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {nome}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Verifique o console do navegador (F12) para logs detalhados.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DiagnosticReport;
