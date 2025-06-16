
import React, { memo } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  activeTab: string;
  setActiveTab: (t: string) => void;
  total: number;
  finalizados: number;
  emAndamento: number;
  atencao: number;
};

const TarotTabsFilterOptimized = memo((props: Props) => {
  const { activeTab, setActiveTab, total, finalizados, emAndamento, atencao } = props;
  
  return (
    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/70 border border-[#ede9fe] rounded-xl mb-6 gap-1 p-1 h-auto">
      <TabsTrigger
        value="todas"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10 text-xs px-2 py-2 h-auto min-h-[2.5rem]"
        onClick={() => setActiveTab("todas")}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm">Todas</span>
          <span className="text-xs">({total})</span>
        </div>
      </TabsTrigger>
      <TabsTrigger
        value="finalizadas"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10 text-xs px-2 py-2 h-auto min-h-[2.5rem]"
        onClick={() => setActiveTab("finalizadas")}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm">Finalizadas</span>
          <span className="text-xs">({finalizados})</span>
        </div>
      </TabsTrigger>
      <TabsTrigger
        value="pendentes"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10 text-xs px-2 py-2 h-auto min-h-[2.5rem]"
        onClick={() => setActiveTab("pendentes")}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm">Pendentes</span>
          <span className="text-xs">({emAndamento})</span>
        </div>
      </TabsTrigger>
      <TabsTrigger
        value="atencao"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10 text-xs px-2 py-2 h-auto min-h-[2.5rem]"
        onClick={() => setActiveTab("atencao")}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm">Atenção</span>
          <span className="text-xs">({atencao})</span>
        </div>
      </TabsTrigger>
    </TabsList>
  );
});

TarotTabsFilterOptimized.displayName = 'TarotTabsFilterOptimized';

export default TarotTabsFilterOptimized;
