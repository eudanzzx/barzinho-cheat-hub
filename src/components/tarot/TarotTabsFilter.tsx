
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
  const { activeTab, setActiveTab, total, finalizados, emAndamento, atencao } =
    props;
  return (
    <TabsList className="grid w-full grid-cols-4 bg-white/70 border border-[#ede9fe] rounded-xl mb-6">
      <TabsTrigger
        value="todas"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
        onClick={() => setActiveTab("todas")}
      >
        Todas ({total})
      </TabsTrigger>
      <TabsTrigger
        value="finalizadas"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
        onClick={() => setActiveTab("finalizadas")}
      >
        Finalizadas ({finalizados})
      </TabsTrigger>
      <TabsTrigger
        value="pendentes"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
        onClick={() => setActiveTab("pendentes")}
      >
        Pendentes ({emAndamento})
      </TabsTrigger>
      <TabsTrigger
        value="atencao"
        className="data-[state=active]:bg-[#673193] data-[state=active]:text-white transition-all duration-300 hover:bg-[#673193]/10"
        onClick={() => setActiveTab("atencao")}
      >
        Atenção ({atencao})
      </TabsTrigger>
    </TabsList>
  );
}
