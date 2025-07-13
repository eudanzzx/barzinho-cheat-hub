import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Calendar, Star, AlertTriangle } from "lucide-react";

interface OptimizedClientFormProps {
  formData: {
    nomeCliente: string;
    dataNascimento: string;
    signo: string;
    atencao: boolean;
    dataInicio: string;
  };
  onUpdateFormData: (field: string, value: any) => void;
}

const OptimizedClientForm: React.FC<OptimizedClientFormProps> = memo(({ 
  formData, 
  onUpdateFormData 
}) => {
  const handleInputChange = useCallback((field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdateFormData(field, e.target.value);
  }, [onUpdateFormData]);

  const handleSwitchChange = useCallback((field: string) => (checked: boolean) => {
    onUpdateFormData(field, checked);
  }, [onUpdateFormData]);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="h-6 w-6" />
          Dados do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nomeCliente" className="text-[#6B21A8] font-medium">
              Nome do Cliente
            </Label>
            <Input
              id="nomeCliente"
              placeholder="Digite o nome completo"
              value={formData.nomeCliente}
              onChange={handleInputChange('nomeCliente')}
              className="bg-white/50 border-purple-200 focus:border-purple-400 focus:ring-purple-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataNascimento" className="text-[#6B21A8] font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de Nascimento
            </Label>
            <Input
              id="dataNascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={handleInputChange('dataNascimento')}
              className="bg-white/50 border-purple-200 focus:border-purple-400 focus:ring-purple-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="signo" className="text-[#6B21A8] font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Signo
            </Label>
            <Input
              id="signo"
              placeholder="Será preenchido automaticamente"
              value={formData.signo}
              readOnly
              className="bg-gray-50 border-purple-200 cursor-not-allowed"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataInicio" className="text-[#6B21A8] font-medium">
              Data de Início
            </Label>
            <Input
              id="dataInicio"
              type="date"
              value={formData.dataInicio}
              onChange={handleInputChange('dataInicio')}
              className="bg-white/50 border-purple-200 focus:border-purple-400 focus:ring-purple-200"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <Label htmlFor="atencao" className="text-yellow-800 font-medium flex-grow">
            Marcar para Atenção Especial
          </Label>
          <Switch
            id="atencao"
            checked={formData.atencao}
            onCheckedChange={handleSwitchChange('atencao')}
            className="data-[state=checked]:bg-yellow-500"
          />
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedClientForm.displayName = 'OptimizedClientForm';

export default OptimizedClientForm;