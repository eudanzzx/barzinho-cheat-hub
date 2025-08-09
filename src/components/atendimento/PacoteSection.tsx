import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Package } from "lucide-react";

interface PacoteSectionProps {
  pacoteAtivo: boolean;
  setPacoteAtivo: (value: boolean) => void;
  pacoteData: {
    dias: string;
    pacoteDias: Array<{
      id: string;
      data: string;
      valor: string;
    }>;
  };
  handlePacoteDataChange: (field: string, value: string) => void;
  handlePacoteDiaChange: (id: string, field: string, value: string) => void;
}

const PacoteSection: React.FC<PacoteSectionProps> = ({
  pacoteAtivo,
  setPacoteAtivo,
  pacoteData,
  handlePacoteDataChange,
  handlePacoteDiaChange,
}) => {
  return (
    <div className="space-y-2 flex flex-col">
      <div className="flex items-center justify-between">
        <Label htmlFor="pacote" className="text-base flex items-center text-slate-700">
          <Package className={`mr-2 h-4 w-4 ${pacoteAtivo ? "text-[#8B5CF6]" : "text-slate-400"}`} />
          PACOTES
        </Label>
        <Switch 
          checked={pacoteAtivo} 
          onCheckedChange={setPacoteAtivo} 
          className="data-[state=checked]:bg-[#8B5CF6]"
        />
      </div>
      
      {pacoteAtivo && (
        <div className="space-y-4 mt-2 p-4 bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-lg">
          <div className="space-y-1">
            <Label className="text-sm text-slate-600">Quantidade de Dias</Label>
            <Select onValueChange={(value) => handlePacoteDataChange("dias", value)} value={pacoteData.dias}>
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
            <div className="space-y-3 max-h-64 overflow-y-auto border border-[#8B5CF6]/20 rounded-lg p-3 bg-white">
              <Label className="text-sm font-medium text-slate-700">Configuração dos Dias</Label>
              {pacoteData.pacoteDias.map((dia, index) => (
                <div key={dia.id} className="grid grid-cols-3 gap-2 p-3 bg-[#8B5CF6]/5 rounded-lg border border-[#8B5CF6]/20">
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
          )}
        </div>
      )}
    </div>
  );
};

export default PacoteSection;