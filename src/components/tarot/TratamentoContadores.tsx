
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { BellRing, ChevronDown } from "lucide-react";

type Lembrete = {
  id: number | string;
  texto: string;
  dias: number;
};

export default function TratamentoContadores({ lembretes }: { lembretes: Lembrete[] }) {
  if (!Array.isArray(lembretes) || lembretes.length === 0) return null;

  // Ordena lembretes do menor para o maior número de dias para expiração
  const sorted = [...lembretes].sort((a, b) => a.dias - b.dias);
  const principal = sorted[0];
  const outros = sorted.slice(1);

  return (
    <div className="mb-4 flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <BellRing className="h-7 w-7 text-[#A067DF] flex-shrink-0 animate-pulse" />
        <div>
          <div className="text-lg font-bold text-[#A067DF]">
            Contador prioritário:
          </div>
          <div className="bg-[#ede9fe] rounded-lg px-4 py-1 mt-1 shadow text-[#32204a] text-xl font-extrabold flex items-baseline gap-3">
            <span>{principal.texto || "Sem descrição"}</span>
            <span className="text-[#8f6ddf] text-base font-semibold ml-2">
              ({principal.dias} dia{principal.dias !== 1 ? "s" : ""} restante{principal.dias !== 1 ? "s" : ""})
            </span>
          </div>
        </div>
      </div>
      
      {outros.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="mt-2 text-[#A067DF]">
              Ver outros contadores <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" className="z-50 min-w-[250px]">
            {outros.map((l) => (
              <DropdownMenuItem key={l.id} className="flex flex-col items-start !py-2">
                <span className="font-semibold">{l.texto || "Sem descrição"}</span>
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
