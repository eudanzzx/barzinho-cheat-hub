
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import useUserDataService from "@/services/userDataService";

function getDiasRestantes(dataInicio: string, dias: number) {
  if (!dataInicio) return 999; // Para ordenação, valores inválidos ficam por último
  const inicio = new Date(dataInicio);
  const hoje = new Date();
  const dataAlvo = new Date(inicio);
  dataAlvo.setDate(inicio.getDate() + dias);
  const diffTime = dataAlvo.getTime() - hoje.getTime();
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
}

const TratamentoContadoresModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const { getAllTarotAnalyses } = useUserDataService();
  const analises = getAllTarotAnalyses();

  // Todos contadores de todas análises
  const tratContadores = analises
    .flatMap((analise: any) =>
      (analise.lembretes || []).map((l: any) => ({
        ...l,
        nomeCliente: analise.nomeCliente,
        dataInicio: analise.dataInicio,
        diasRestantes: getDiasRestantes(analise.dataInicio, l.dias),
      }))
    )
    .filter((l) => l.texto && l.dias > 0)
    .sort((a, b) => a.diasRestantes - b.diasRestantes); // Ordena por dias restantes

  if (tratContadores.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg w-[96vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-800">
              <Bell className="h-5 w-5" />
              Contadores de Tratamento
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-gray-500">
            Nenhum contador de tratamento registrado!
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Separar contadores por prioridade
  const prioritarios = tratContadores.filter(c => c.diasRestantes <= 3); // 3 dias ou menos
  const outros = tratContadores.filter(c => c.diasRestantes > 3);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[96vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-800">
            <Bell className="h-5 w-5" />
            Contadores de Tratamento
            <Badge className="ml-2 bg-violet-200 text-violet-900">{tratContadores.length}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
          {/* Contadores prioritários (sempre visíveis) */}
          {prioritarios.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-red-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Próximos ao Vencimento ({prioritarios.length})
              </h3>
              {prioritarios.map((contador) => (
                <div key={`${contador.nomeCliente}-${contador.id}`} 
                     className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2">
                  <div className="font-bold text-red-900 mb-1">{contador.nomeCliente}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-red-800">{contador.texto}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      contador.diasRestantes === 0 
                        ? "text-red-700 bg-red-100 border-red-300"
                        : contador.diasRestantes <= 1
                        ? "text-amber-700 bg-amber-100 border-amber-300"
                        : "text-red-600 bg-red-50 border-red-200"
                    }`}>
                      {contador.diasRestantes === 0 ? "Venceu hoje!" : 
                       `${contador.diasRestantes} dia${contador.diasRestantes !== 1 ? "s" : ""} restante${contador.diasRestantes !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Outros contadores (em accordion) */}
          {outros.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="outros-contadores" className="border border-purple-200 rounded-lg">
                <AccordionTrigger className="px-3 py-2 text-purple-800 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Outros Contadores ({outros.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="space-y-2">
                    {outros.map((contador) => (
                      <div key={`${contador.nomeCliente}-${contador.id}`} 
                           className="rounded-lg border border-purple-100 bg-purple-50/80 px-3 py-2">
                        <div className="font-bold text-purple-900 mb-1">{contador.nomeCliente}</div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#6B21A8]">{contador.texto}</span>
                          <span className="text-xs text-[#A067DF] bg-white/70 border border-[#ece0fd] px-2 py-1 rounded-full">
                            {contador.diasRestantes} dia{contador.diasRestantes !== 1 ? "s" : ""} restante{contador.diasRestantes !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TratamentoContadoresModal;
