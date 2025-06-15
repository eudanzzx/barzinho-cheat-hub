
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { BellRing, ChevronDown } from "lucide-react";

type Lembrete = {
  id: number | string;
  texto: string;
  dias: number;
};

export default function TratamentoContadores({ lembretes, inline = false }: { lembretes: Lembrete[], inline?: boolean }) {
  if (!Array.isArray(lembretes) || lembretes.length === 0) return null;

  // Ordena os lembretes do menor para o maior número de dias
  const sorted = [...lembretes].sort((a, b) => a.dias - b.dias);
  const principal = sorted[0];
  const outros = sorted.slice(1);

  // Visual mais limpo, inline e compacto
  return (
    <div className={`flex items-center gap-2 ${inline ? "" : "mt-2 mb-2"}`}>
      <span
        className="flex items-center gap-2 border border-[#d9cdfc] bg-[#f4f0ff] px-3 py-1 rounded-full shadow-sm"
        style={{ minHeight: 0 }}
      >
        <BellRing className="h-4 w-4 text-[#A067DF] flex-shrink-0" />
        <span className="font-semibold text-[#673193] text-sm">{principal.texto || "Sem descrição"}</span>
        <span className="text-xs text-[#A067DF] font-medium">
          ({principal.dias} dia{principal.dias !== 1 ? "s" : ""} restante{principal.dias !== 1 ? "s" : ""})
        </span>
      </span>
      {outros.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm" variant="outline" className="px-2 py-0 leading-none text-xs border-[#d9cdfc] text-[#A067DF] shadow-sm">
              Outros <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="z-50 min-w-[200px] rounded-md p-1 text-xs">
            {outros.map((l) => (
              <DropdownMenuItem key={l.id} className="flex flex-col items-start px-2 py-1.5 rounded">
                <span className="font-semibold text-[#673193]">{l.texto || "Sem descrição"}</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({l.dias} dia{l.dias !== 1 ? "s" : ""} restante{l.dias !== 1 ? "s" : ""})
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
