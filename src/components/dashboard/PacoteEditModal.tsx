import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Calendar, DollarSign } from "lucide-react";
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

interface PacoteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  atendimentoId: string;
  clientName: string;
  pacoteData: PacoteData;
}

const PacoteEditModal: React.FC<PacoteEditModalProps> = ({
  isOpen,
  onClose,
  atendimentoId,
  clientName,
  pacoteData: initialPacoteData
}) => {
  const [pacoteData, setPacoteData] = useState<PacoteData>(initialPacoteData);
  const { getAtendimentos, saveAtendimentos } = useUserDataService();

  useEffect(() => {
    setPacoteData(initialPacoteData);
  }, [initialPacoteData]);

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

  const handlePacoteDiaChange = (id: string, field: string, value: string) => {
    setPacoteData(prev => ({
      ...prev,
      pacoteDias: prev.pacoteDias.map(dia => 
        dia.id === id ? { ...dia, [field]: value } : dia
      ),
    }));
  };

  const handleSave = () => {
    try {
      const atendimentos = getAtendimentos();
      const updatedAtendimentos = atendimentos.map(atendimento => {
        if (atendimento.id === atendimentoId) {
          return {
            ...atendimento,
            pacoteData: pacoteData
          };
        }
        return atendimento;
      });

      saveAtendimentos(updatedAtendimentos);
      
      toast.success(`Pacote de ${clientName} atualizado com sucesso!`, {
        description: "As alterações foram salvas."
      });
      
      onClose();
      
      // Recarregar a página para mostrar as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao salvar pacote:', error);
      toast.error("Erro ao salvar as alterações do pacote.");
    }
  };

  const diasComData = pacoteData.pacoteDias.filter(dia => dia.data && dia.data.trim() !== '');
  const diasSemData = pacoteData.pacoteDias.filter(dia => !dia.data || dia.data.trim() === '');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#8B5CF6]" />
            Editar Pacote - {clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#8B5CF6]/10 rounded-lg border border-[#8B5CF6]/20">
            <div>
              <h3 className="font-semibold text-[#8B5CF6]">Pacote de {pacoteData.dias} dias</h3>
              <p className="text-sm text-slate-600">Configure as datas e valores de cada sessão</p>
            </div>
            <Badge variant="secondary" className="bg-[#8B5CF6]/10 text-[#8B5CF6]">
              {pacoteData.dias} sessões
            </Badge>
          </div>

          {diasComData.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Sessões Agendadas ({diasComData.length})
              </h4>
              <div className="space-y-3">
                {diasComData.map((dia, index) => (
                  <div
                    key={dia.id}
                    className="p-3 bg-white rounded-lg border border-[#8B5CF6]/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[#8B5CF6]">
                        Sessão #{index + 1}
                      </Badge>
                      <div className="text-sm text-slate-500">
                        {dia.data ? formatarDataSegura(dia.data) : 'Data não definida'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Data da Sessão</Label>
                        <Input
                          type="date"
                          value={dia.data}
                          onChange={(e) => handlePacoteDiaChange(dia.id, 'data', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Valor (R$)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={dia.valor}
                          onChange={(e) => handlePacoteDiaChange(dia.id, 'valor', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {diasSemData.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 opacity-50" />
                Sessões Pendentes ({diasSemData.length})
              </h4>
              <div className="space-y-3">
                {diasSemData.map((dia, index) => (
                  <div
                    key={dia.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-slate-100">
                        Sessão #{diasComData.length + index + 1}
                      </Badge>
                      <div className="text-sm text-slate-400">
                        Aguardando agendamento
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Data da Sessão</Label>
                        <Input
                          type="date"
                          value={dia.data}
                          onChange={(e) => handlePacoteDiaChange(dia.id, 'data', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Valor (R$)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={dia.valor}
                          onChange={(e) => handlePacoteDiaChange(dia.id, 'valor', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PacoteEditModal;