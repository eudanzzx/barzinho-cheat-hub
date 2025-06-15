
import React from "react";
import { Check, X, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

interface AnalysisActionsProps {
  analise: any;
  onToggleFinished: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const AnalysisActions: React.FC<AnalysisActionsProps> = ({
  analise,
  onToggleFinished,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex gap-2 ml-0 md:ml-4">
      <Button
        size="sm"
        variant={analise.finalizado ? "outline" : "default"}
        className={
          analise.finalizado
            ? "border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            : "bg-tarot-primary text-white border-tarot-primary hover:bg-tarot-primary"
        }
        onClick={() => onToggleFinished(analise.id)}
      >
        {analise.finalizado ? (
          <X className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-[#ede9fe] text-tarot-primary hover:bg-[#ede9fe]"
        onClick={() => onEdit(analise.id)}
      >
        <Edit3 className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="destructive"
            className="border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white/98 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a análise de <strong>{analise.nomeCliente}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-slate-100 transition-colors duration-300">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(analise.id)}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AnalysisActions;
