
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Logo from "@/components/Logo";
import { toast } from "sonner";

const TarotReportHeader = () => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <Logo height={50} width={50} />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#673193]">
            Relatórios Individuais - Tarot
          </h1>
          <p className="text-[#673193] mt-1 opacity-80">Análises por cliente</p>
        </div>
      </div>
      <Button
        onClick={() => toast.success("Funcionalidade em desenvolvimento")}
        className="bg-[#673193] hover:bg-[#673193]/90 text-white w-full sm:w-auto flex items-center justify-center gap-2"
      >
        <Download className="h-4 w-4" />
        <span>Baixar PDF Geral</span>
      </Button>
    </div>
  );
};

export default TarotReportHeader;
