
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Clock, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import useUserDataService from "@/services/userDataService";
import { calculateDaysRemaining } from "@/utils/dateFormatter";

function getDiasRestantes(dataInicio: string, dias: number) {
  return calculateDaysRemaining(dataInicio, dias);
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

  // Agrupar contadores por cliente
  const contadoresPorCliente = tratContadores.reduce((acc: any, contador) => {
    const cliente = contador.nomeCliente;
    if (!acc[cliente]) {
      acc[cliente] = [];
    }
    acc[cliente].push(contador);
    return acc;
  }, {});

  // Para cada cliente, pegar o contador mais próximo ao vencimento e os outros
  const clientesComContadores = Object.entries(contadoresPorCliente).map(([cliente, contadores]: [string, any]) => {
    const contadoresOrdenados = contadores.sort((a: any, b: any) => a.diasRestantes - b.diasRestantes);
    return {
      cliente,
      principal: contadoresOrdenados[0], // Mais próximo ao vencimento
      outros: contadoresOrdenados.slice(1), // Outros contadores
    };
  }).sort((a, b) => a.principal.diasRestantes - b.principal.diasRestantes); // Ordena clientes pelo contador mais próximo

  // Separar clientes por prioridade
  const clientesPrioritarios = clientesComContadores.filter(c => c.principal.diasRestantes <= 3);
  const outrosClientes = clientesComContadores.filter(c => c.principal.diasRestantes > 3);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[96vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-800">
            <Bell className="h-5 w-5" />
            Contadores de Tratamento
            <Badge className="ml-2 bg-violet-200 text-violet-900">{clientesComContadores.length}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
          {/* Clientes prioritários (sempre visíveis) */}
          {clientesPrioritarios.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-red-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Próximos ao Vencimento ({clientesPrioritarios.length})
              </h3>
              {clientesPrioritarios.map(({ cliente, principal, outros }) => (
                <div key={cliente} className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2">
                  <div className="font-bold text-red-900 mb-1">{cliente}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-red-800">{principal.texto}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      principal.diasRestantes === 0 
                        ? "text-red-700 bg-red-100 border-red-300"
                        : principal.diasRestantes <= 1
                        ? "text-amber-700 bg-amber-100 border-amber-300"
                        : "text-red-600 bg-red-50 border-red-200"
                    }`}>
                      {principal.diasRestantes === 0 ? "Venceu hoje!" : 
                       `${principal.diasRestantes} dia${principal.diasRestantes !== 1 ? "s" : ""} restante${principal.diasRestantes !== 1 ? "s" : ""}`}
                    </span>
                    {outros.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-red-700 hover:bg-red-100">
                            +{outros.length} <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {outros.map((contador: any) => (
                            <DropdownMenuItem key={contador.id} className="flex flex-col items-start p-3">
                              <span className="font-medium text-gray-900">{contador.texto}</span>
                              <span className="text-xs text-gray-500">
                                {contador.diasRestantes} dia{contador.diasRestantes !== 1 ? "s" : ""} restante{contador.diasRestantes !== 1 ? "s" : ""}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Outros clientes (em accordion) */}
          {outrosClientes.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="outros-clientes" className="border border-purple-200 rounded-lg">
                <AccordionTrigger className="px-3 py-2 text-purple-800 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Outros Clientes ({outrosClientes.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="space-y-2">
                    {outrosClientes.map(({ cliente, principal, outros }) => (
                      <div key={cliente} className="rounded-lg border border-purple-100 bg-purple-50/80 px-3 py-2">
                        <div className="font-bold text-purple-900 mb-1">{cliente}</div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#6B21A8]">{principal.texto}</span>
                          <span className="text-xs text-[#A067DF] bg-white/70 border border-[#ece0fd] px-2 py-1 rounded-full">
                            {principal.diasRestantes} dia{principal.diasRestantes !== 1 ? "s" : ""} restante{principal.diasRestantes !== 1 ? "s" : ""}
                          </span>
                          {outros.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-purple-700 hover:bg-purple-100">
                                  +{outros.length} <ChevronDown className="h-3 w-3 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                {outros.map((contador: any) => (
                                  <DropdownMenuItem key={contador.id} className="flex flex-col items-start p-3">
                                    <span className="font-medium text-gray-900">{contador.texto}</span>
                                    <span className="text-xs text-gray-500">
                                      {contador.diasRestantes} dia{contador.diasRestantes !== 1 ? "s" : ""} restante{contador.diasRestantes !== 1 ? "s" : ""}
                                    </span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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
