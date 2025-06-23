
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MainCounterPriorityNotifications from "@/components/MainCounterPriorityNotifications";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainPriorityPaymentsModalProps {
  atendimentos: any[];
}

const MainPriorityPaymentsModal: React.FC<MainPriorityPaymentsModalProps> = ({ atendimentos }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 sm:gap-2 text-main-primary bg-blue-100 hover:bg-blue-200 px-2 sm:px-4 py-1 sm:py-2 rounded-xl font-bold shadow border border-blue-200 transition-all text-xs sm:text-base"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[#0ea5e9]" />
          <span className="hidden sm:inline">Próximos Vencimentos</span>
          <span className="sm:hidden">Vencimentos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[96vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-blue-800">
            <Bell className="h-5 w-5" />
            Próximos Vencimentos - Atendimentos
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <MainCounterPriorityNotifications atendimentos={atendimentos} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainPriorityPaymentsModal;
