import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PacoteEditModal from "./PacoteEditModal";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";

interface PacoteDia {
  id: string;
  data: string;
  valor: string;
}

interface PacoteData {
  dias: string;
  pacoteDias: PacoteDia[];
}

interface AtendimentoPacoteButtonProps {
  pacoteData: PacoteData;
  clientName: string;
  atendimentoId?: string;
}

const AtendimentoPacoteButton: React.FC<AtendimentoPacoteButtonProps> = ({
  pacoteData,
  clientName,
  atendimentoId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { getAtendimentos } = useUserDataService();

  const formatarDataSegura = (data: string) => {
    if (!data || data.trim() === '') return '';
    
    try {
      const [ano, mes, dia] = data.split('-');
      if (ano && mes && dia) {
        return `${dia}/${mes}/${ano}`;
      }
      return data;
    } catch (error) {
      return data;
    }
  };

  const diasComData = pacoteData.pacoteDias.filter(dia => dia.data && dia.data.trim() !== '');
  const diasSemData = pacoteData.pacoteDias.filter(dia => !dia.data || dia.data.trim() === '');

  const findAtendimentoId = () => {
    if (atendimentoId) return atendimentoId;
    
    // Se não foi passado o ID, tentar encontrar pelo nome do cliente
    const atendimentos = getAtendimentos();
    const atendimento = atendimentos.find(a => a.nome === clientName && a.pacoteAtivo);
    return atendimento?.id || '';
  };

  const handleEditClick = () => {
    const foundId = findAtendimentoId();
    if (!foundId) {
      toast.error("Não foi possível identificar o atendimento para edição.");
      return;
    }
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/20"
      >
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="font-medium">Pacote ({pacoteData.dias} dias)</span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isExpanded && (
        <div className="space-y-3 p-3 bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700">
              Pacote de {clientName}
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#8B5CF6]/10 text-[#8B5CF6]">
                {pacoteData.dias} sessões
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditClick}
                className="h-6 px-2 text-xs border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
          </div>

          {diasComData.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-slate-600">Sessões Agendadas</h5>
              <div className="grid gap-2">
                {diasComData.map((dia, index) => (
                  <div
                    key={dia.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-[#8B5CF6]/20"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-sm text-slate-700">
                        {formatarDataSegura(dia.data)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-[#8B5CF6]">
                      {dia.valor ? `R$ ${dia.valor}` : 'Valor não definido'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {diasSemData.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-slate-600">Sessões Pendentes</h5>
              <div className="grid gap-2">
                {diasSemData.map((dia, index) => (
                  <div
                    key={dia.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-slate-100">
                        #{diasComData.length + index + 1}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        Data não definida
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {dia.valor ? `R$ ${dia.valor}` : 'Valor não definido'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pacoteData.pacoteDias.length === 0 && (
            <div className="text-center py-4 text-slate-500">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma sessão configurada</p>
            </div>
          )}
        </div>
      )}

      {isEditModalOpen && (
        <PacoteEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          atendimentoId={findAtendimentoId()}
          clientName={clientName}
          pacoteData={pacoteData}
        />
      )}
    </div>
  );
};

export default AtendimentoPacoteButton;