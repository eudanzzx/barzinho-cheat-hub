
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  activeTab: string;
  setActiveTab: (t: string) => void;
  total: number;
  finalizados: number;
  emAndamento: number;
  atencao: number;
};

export default function TarotTabsFilter(props: Props) {
  const { activeTab, setActiveTab, total, finalizados, emAndamento, atencao } = props;
  
  return (
    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/70 border border-[#ede9fe] rounded-xl mb-6 gap-1 p-1">
      <TabsTrigger
        value="todas"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10 text-xs sm:text-sm px-2 py-2"
        onClick={() => setActiveTab("todas")}
      >
        <span className="hidden sm:inline">Todas</span>
        <span className="sm:hidden">Todas</span>
        <span className="ml-1">({total})</span>
      </TabsTrigger>
      <TabsTrigger
        value="finalizadas"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10 text-xs sm:text-sm px-2 py-2"
        onClick={() => setActiveTab("finalizadas")}
      >
        <span className="hidden sm:inline">Finalizadas</span>
        <span className="sm:hidden">Finalizadas</span>
        <span className="ml-1">({finalizados})</span>
      </TabsTrigger>
      <TabsTrigger
        value="pendentes"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10 text-xs sm:text-sm px-2 py-2"
        onClick={() => setActiveTab("pendentes")}
      >
        <span className="hidden sm:inline">Pendentes</span>
        <span className="sm:hidden">Pendentes</span>
        <span className="ml-1">({emAndamento})</span>
      </TabsTrigger>
      <TabsTrigger
        value="atencao"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10 text-xs sm:text-sm px-2 py-2"
        onClick={() => setActiveTab("atencao")}
      >
        <span className="hidden sm:inline">Atenção</span>
        <span className="sm:hidden">Atenção</span>
        <span className="ml-1">({atencao})</span>
      </TabsTrigger>
    </TabsList>
  );
}
