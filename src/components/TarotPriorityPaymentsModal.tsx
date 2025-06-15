
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TarotCounterPriorityNotifications from "@/components/TarotCounterPriorityNotifications";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TarotPriorityPaymentsModalProps {
  analises: any[];
}

const TarotPriorityPaymentsModal: React.FC<TarotPriorityPaymentsModalProps> = ({ analises }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-tarot-primary bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-xl font-bold shadow border border-purple-200 transition-all text-base"
        >
          <Bell className="h-5 w-5 text-[#8e46dd] mr-1" />
          Próximos Vencimentos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[96vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-purple-800">
            <Bell className="h-5 w-5" />
            Próximos Vencimentos - Análises de Tarot
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <TarotCounterPriorityNotifications analises={analises} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TarotPriorityPaymentsModal;
