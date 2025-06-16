
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NovoAtendimentoHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-center gap-3">
      <Button 
        variant="ghost" 
        className="text-[#0EA5E9] hover:bg-white/80 hover:text-[#0EA5E9] transition-all duration-200" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      <h1 className="text-2xl font-bold text-[#0EA5E9]">
        Novo Atendimento
      </h1>
    </div>
  );
};

export default NovoAtendimentoHeader;
