
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type Lembrete = {
  id: number | string;
  texto: string;
  dias: number;
};

interface LembreteDropdownProps {
  lembretes: Lembrete[];
}

const LembreteDropdown: React.FC<LembreteDropdownProps> = ({ lembretes }) => {
  if (lembretes.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="px-2 py-0 leading-none text-xs border-[#d9cdfc] text-[#A067DF] shadow-sm">
          Outros <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="z-50 min-w-[200px] rounded-md p-1 text-xs">
        {lembretes.map((l) => (
          <DropdownMenuItem key={l.id} className="flex flex-col items-start px-2 py-1.5 rounded">
            <span className="font-semibold text-[#673193]">{l.texto || "Sem descrição"}</span>
            <span className="text-xs text-gray-500 ml-1">
              ({l.dias} dia{l.dias !== 1 ? "s" : ""} restante{l.dias !== 1 ? "s" : ""})
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LembreteDropdown;
