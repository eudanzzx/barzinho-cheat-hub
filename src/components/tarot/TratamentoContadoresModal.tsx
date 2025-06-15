
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useUserDataService from "@/services/userDataService";

function getDiasRestantes(dataInicio: string, dias: number) {
  if (!dataInicio) return "-";
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
      }))
    )
    .filter((l) => l.texto && l.dias > 0);

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

  // Exibir agrupados por cliente
  const porCliente: Record<string, typeof tratContadores> = {};
  tratContadores.forEach((c) => {
    if (!porCliente[c.nomeCliente]) porCliente[c.nomeCliente] = [];
    porCliente[c.nomeCliente].push(c);
  });

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
        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4">
          {Object.entries(porCliente).map(([cliente, contadores]) => (
            <div key={cliente} className="rounded-lg border border-purple-100 bg-purple-50/80 px-3 py-2">
              <div className="font-bold text-purple-900 mb-1">{cliente}</div>
              <ul className="space-y-2">
                {contadores.map((l) => {
                  const diasRestantes = getDiasRestantes(l.dataInicio, l.dias);
                  return (
                    <li key={l.id} className="flex items-center gap-2">
                      <span className="font-medium text-[#6B21A8]">{l.texto}</span>
                      <span className="text-xs text-[#A067DF] bg-white/70 border border-[#ece0fd] px-2 py-1 rounded-full">
                        {diasRestantes} dia{diasRestantes !== 1 ? "s" : ""} restante{diasRestantes !== 1 ? "s" : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TratamentoContadoresModal;
