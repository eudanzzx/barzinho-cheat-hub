import React, { memo, useCallback, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOptimizedDebounce } from "@/hooks/useOptimizedDebounce";

interface OptimizedClientFormProps {
  nomeCliente: string;
  setNomeCliente: (value: string) => void;
  dataNascimento: string;
  onDataNascimentoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  signo: string;
  atencao: boolean;
  setAtencao: (value: boolean) => void;
  dataInicio: string;
  setDataInicio: (value: string) => void;
  preco: string;
  setPreco: (value: string) => void;
}

const OptimizedClientForm: React.FC<OptimizedClientFormProps> = memo(({
  nomeCliente,
  setNomeCliente,
  dataNascimento,
  onDataNascimentoChange,
  signo,
  atencao,
  setAtencao,
  dataInicio,
  setDataInicio,
  preco,
  setPreco
}) => {
  const debouncedNomeChange = useOptimizedDebounce(setNomeCliente, 150);
  const debouncedPrecoChange = useOptimizedDebounce(setPreco, 200);

  const handleNomeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedNomeChange(e.target.value);
  }, [debouncedNomeChange]);

  const handlePrecoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedPrecoChange(e.target.value);
  }, [debouncedPrecoChange]);

  const handleDataInicioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDataInicio(e.target.value);
  }, [setDataInicio]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="nomeCliente">Nome do Cliente</Label>
        <Input
          id="nomeCliente"
          defaultValue={nomeCliente}
          onChange={handleNomeChange}
          placeholder="Digite o nome do cliente..."
          className="bg-white/50"
        />
      </div>
      
      <div>
        <Label htmlFor="dataNascimento">Data de Nascimento</Label>
        <Input
          id="dataNascimento"
          type="date"
          value={dataNascimento}
          onChange={onDataNascimentoChange}
          className="bg-white/50"
        />
      </div>

      <div>
        <Label htmlFor="signo">Signo</Label>
        <Input
          id="signo"
          value={signo}
          readOnly
          placeholder="Calculado automaticamente"
          className="bg-gray-50"
        />
      </div>

      <div>
        <Label htmlFor="dataInicio">Data de Início</Label>
        <Input
          id="dataInicio"
          type="date"
          value={dataInicio}
          onChange={handleDataInicioChange}
          className="bg-white/50"
        />
      </div>

      <div>
        <Label htmlFor="preco">Preço (R$)</Label>
        <Input
          id="preco"
          type="number"
          defaultValue={preco}
          onChange={handlePrecoChange}
          placeholder="150"
          className="bg-white/50"
        />
      </div>
    </div>
  );
});

OptimizedClientForm.displayName = 'OptimizedClientForm';

export default OptimizedClientForm;