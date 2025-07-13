
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useDataCleanupService } from "@/services/dataCleanupService";

const DataCleanupButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { clearAllData } = useDataCleanupService();

  const handleConfirmCleanup = () => {
    clearAllData();
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Limpar Todos os Dados
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Limpeza Completa</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação irá remover TODOS os dados salvos, incluindo:
            <br />
            • Todas as análises de tarot
            <br />
            • Todos os atendimentos
            <br />
            • Todos os planos de pagamento
            <br />
            • Todas as notificações
            <br />
            <br />
            <strong>Esta ação não pode ser desfeita!</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmCleanup}
            className="bg-red-600 hover:bg-red-700"
          >
            Sim, Limpar Tudo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DataCleanupButton;
