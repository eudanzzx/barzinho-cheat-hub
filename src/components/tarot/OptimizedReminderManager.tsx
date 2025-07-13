import React, { memo, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, BellRing } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOptimizedDebounce } from "@/hooks/useOptimizedDebounce";

interface OptimizedReminderProps {
  lembretes: Array<{id: number; texto: string; dias: number}>;
  onUpdate: (id: number, campo: string, valor: any) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

const ReminderItem = memo(({ lembrete, onUpdate, onRemove }: {
  lembrete: {id: number; texto: string; dias: number};
  onUpdate: (id: number, campo: string, valor: any) => void;
  onRemove: (id: number) => void;
}) => {
  const [localTexto, setLocalTexto] = useState(lembrete.texto);
  const debouncedText = useOptimizedDebounce(localTexto, 300);

  React.useEffect(() => {
    if (debouncedText !== lembrete.texto) {
      onUpdate(lembrete.id, 'texto', debouncedText);
    }
  }, [debouncedText, lembrete.id, lembrete.texto, onUpdate]);

  const handleTextoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalTexto(e.target.value);
  }, []);

  const handleDiasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(lembrete.id, 'dias', parseInt(e.target.value) || 0);
  }, [lembrete.id, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(lembrete.id);
  }, [lembrete.id, onRemove]);

  return (
    <div className="flex flex-col gap-3 p-3 border border-slate-200 rounded-md bg-white/50">
      <div className="flex items-center gap-2">
        <BellRing className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-600">Contador {lembrete.id}</span>
        <div className="flex-grow"></div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleRemove}
          className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <Textarea 
            placeholder="Descrição do tratamento..." 
            defaultValue={lembrete.texto}
            onChange={handleTextoChange}
            className="min-h-[60px] text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Avisar em</span>
          <Input 
            type="number" 
            className="w-16 text-sm" 
            value={lembrete.dias}
            onChange={handleDiasChange}
          />
          <span className="text-sm text-slate-600">dias</span>
        </div>
      </div>
    </div>
  );
});

ReminderItem.displayName = 'ReminderItem';

const OptimizedReminderManager: React.FC<OptimizedReminderProps> = memo(({
  lembretes,
  onUpdate,
  onAdd,
  onRemove
}) => {
  const reminderItems = useMemo(() => 
    lembretes.map(lembrete => (
      <ReminderItem
        key={lembrete.id}
        lembrete={lembrete}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    )), [lembretes, onUpdate, onRemove]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Contadores de Tratamento</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onAdd}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminderItems}
      </CardContent>
    </Card>
  );
});

OptimizedReminderManager.displayName = 'OptimizedReminderManager';

export default OptimizedReminderManager;