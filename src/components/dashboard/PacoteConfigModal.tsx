import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Save } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";

interface PacoteConfigModalProps {
  atendimento: {
    id: string;
    nome: string;
    pacoteAtivo?: boolean;
    pacoteData?: {
      dias: string;
      pacoteDias: Array<{
        id: string;
        data: string;
        valor: string;
      }>;
    } | null;
  };
  onUpdate: () => void;
}

const PacoteConfigModal: React.FC<PacoteConfigModalProps> = ({ atendimento, onUpdate }) => {
  const { getAtendimentos, saveAtendimentos } = useUserDataService();
  const [open, setOpen] = useState(false);
  const [pacoteData, setPacoteData] = useState(
    atendimento.pacoteData || {
      dias: "",
      pacoteDias: [],
    }
  );

  const handleDiasChange = useCallback((value: string) => {
    const numDias = parseInt(value) || 0;
    const novosPacoteDias = Array.from({ length: numDias }, (_, index) => ({
      id: `pacote-dia-${Date.now()}-${index}`,
      data: "",
      valor: "",
    }));
    
    setPacoteData({
      dias: value,
      pacoteDias: novosPacoteDias,
    });
  }, []);

  const handlePacoteDiaChange = useCallback((id: string, field: string, value: string) => {
    setPacoteData(prev => ({
      ...prev,
      pacoteDias: prev.pacoteDias.map(dia => 
        dia.id === id ? { ...dia, [field]: value } : dia
      ),
    }));
  }, []);

  const handleSave = useCallback(() => {
    const atendimentos = getAtendimentos();
    const updatedAtendimentos = atendimentos.map(a => 
      a.id === atendimento.id 
        ? { 
            ...a, 
            pacoteAtivo: true,
            pacoteData: pacoteData 
          }
        : a
    );
    
    saveAtendimentos(updatedAtendimentos);
    toast.success("Configuração de pacote salva!");
    setOpen(false);
    onUpdate();
  }, [atendimento.id, pacoteData, getAtendimentos, saveAtendimentos, onUpdate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 bg-[#8B5CF6]/10 border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20 text-[#8B5CF6]"
        >
          <Package className="h-4 w-4 mr-1" />
          {atendimento.pacoteAtivo ? "Editar Pacote" : "Config. Pacote"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-[#8B5CF6]">
            <Package className="h-5 w-5 mr-2" />
            Configurar Pacote - {atendimento.nome}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-600">Quantidade de Dias</Label>
            <Select onValueChange={handleDiasChange} value={pacoteData.dias}>
              <SelectTrigger className="bg-[#8B5CF6]/10 border-[#8B5CF6]/30 focus:border-[#8B5CF6]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(30)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} {i === 0 ? 'dia' : 'dias'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {pacoteData.pacoteDias.length > 0 && (
            <div className="space-y-3 border border-[#8B5CF6]/20 rounded-lg p-4 bg-[#8B5CF6]/5">
              <Label className="text-sm font-medium text-slate-700">Configuração dos Dias</Label>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {pacoteData.pacoteDias.map((dia, index) => (
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
                        placeholder="0.00" 
                        step="0.01"
                        value={dia.valor}
                        onChange={(e) => handlePacoteDiaChange(dia.id, "valor", e.target.value)}
                        className="bg-white border-[#8B5CF6]/30 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar Configuração
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PacoteConfigModal;