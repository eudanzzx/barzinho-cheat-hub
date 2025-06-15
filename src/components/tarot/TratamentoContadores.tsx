
import React from "react";
import { BellRing } from "lucide-react";
import LembreteDropdown from "./TratamentoContadores/LembreteDropdown";

type Lembrete = {
  id: number | string;
  texto: string;
  dias: number;
};

export default function TratamentoContadores({ lembretes, inline = false }: { lembretes: Lembrete[], inline?: boolean }) {
  if (!Array.isArray(lembretes) || lembretes.length === 0) return null;

  const sorted = [...lembretes].sort((a, b) => a.dias - b.dias);
  const principal = sorted[0];
  const outros = sorted.slice(1);

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
      {outros.length > 0 && <LembreteDropdown lembretes={outros} />}
    </div>
  );
}
