import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Package, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [localPacoteData, setLocalPacoteData] = useState<PacoteData>(pacoteData);
  const { getAtendimentos, saveAtendimentos } = useUserDataService();

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

  const findAtendimentoId = () => {
    if (atendimentoId) return atendimentoId;
    const atendimentos = getAtendimentos();
    const atendimento = atendimentos.find(a => a.nome === clientName && a.pacoteAtivo);
    return atendimento?.id || '';
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isExpanded) setLocalPacoteData(pacoteData);
    setIsExpanded(!isExpanded);
  };

  const handlePacoteDiaChange = (id: string, field: string, value: string) => {
    setLocalPacoteData(prev => ({
      ...prev,
      pacoteDias: prev.pacoteDias.map(dia =>
        dia.id === id ? { ...dia, [field]: value } : dia
      ),
    }));
  };

  const handleSave = () => {
    const id = findAtendimentoId();
    if (!id) {
      toast.error("Não foi possível identificar o atendimento para salvar.");
      return;
    }
    const atendimentos = getAtendimentos();
    const updatedAtendimentos = atendimentos.map(a =>
      a.id === id
        ? {
            ...a,
            pacoteAtivo: true,
            pacoteData: localPacoteData,
          }
        : a
    );
    saveAtendimentos(updatedAtendimentos);
    toast.success("Configuração do pacote salva!");
    setIsExpanded(false);
  };

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        type="button"
        className="border-purple-500/30 text-purple-700 hover:bg-purple-50 hover:border-purple-500 transition-colors duration-200 flex items-center justify-center gap-1 px-2 py-1.5 text-xs h-8"
      >
        <Package className="h-3 w-3" />
        <span className="font-medium text-xs">Pacote ({pacoteData.dias})</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
      </Button>

      {isExpanded && (
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 bg-black/30"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsExpanded(false);
            }}
            aria-modal="true"
            role="dialog"
          >
            <div className="w-[95vw] max-w-[720px] max-h-[80vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-slate-700">Pacote de {clientName}</h4>
                <Badge variant="secondary" className="bg-[#8B5CF6]/10 text-[#8B5CF6]">
                  {localPacoteData.dias} sessões
                </Badge>
              </div>

              {localPacoteData.pacoteDias.length > 0 ? (
                <div className="space-y-3 border border-[#8B5CF6]/20 rounded-lg p-4 bg-[#8B5CF6]/5">
                  <Label className="text-sm font-medium text-slate-700">Configuração dos Dias</Label>
                  <div className="space-y-3">
                    {localPacoteData.pacoteDias.map((dia, index) => (
                      <div key={dia.id} className="grid grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-[#8B5CF6]/20">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-600">Dia {index + 1}</Label>
                          <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
                            Sessão {index + 1}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-600">Data</Label>
                          <Input
                            type="date"
                            value={dia.data}
                            onChange={(e) => handlePacoteDiaChange(dia.id, "data", e.target.value)}
                            className="bg-white border-[#8B5CF6]/30 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-600">Valor (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={dia.valor}
                            onChange={(e) => handlePacoteDiaChange(dia.id, "valor", e.target.value)}
                            className="bg-white border-[#8B5CF6]/30 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma sessão configurada</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button variant="outline" size="sm" onClick={() => setIsExpanded(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white">
                  Salvar Configuração
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
};

export default AtendimentoPacoteButton;
