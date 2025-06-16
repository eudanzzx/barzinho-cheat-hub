
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Save } from "lucide-react";

interface NovoAtendimentoFooterProps {
  onSave: () => void;
}

const NovoAtendimentoFooter: React.FC<NovoAtendimentoFooterProps> = ({ onSave }) => {
  const navigate = useNavigate();

  return (
    <CardFooter className="flex justify-end gap-3 border-t border-white/10 px-0 py-4">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="border-white/20 text-slate-600 hover:bg-white/50"
      >
        Cancelar
      </Button>
      <Button 
        className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
        onClick={onSave}
      >
        <Save className="h-4 w-4 mr-2" />
        Finalizar Atendimento
      </Button>
    </CardFooter>
  );
};

export default NovoAtendimentoFooter;
