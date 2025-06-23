
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
          className="flex items-center gap-1 text-main-primary bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-xl font-bold shadow border border-blue-200 transition-all text-xs h-8 min-w-fit"
        >
          <Bell className="h-4 w-4 text-[#0ea5e9] flex-shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Próximos Vencimentos</span>
          <span className="sm:hidden whitespace-nowrap">Vencimentos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 px-2 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-blue-800 text-sm sm:text-base">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Próximos Vencimentos - Atendimentos</span>
            <span className="sm:hidden">Vencimentos</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-2 sm:px-6 pb-2 sm:pb-6">
          <MainCounterPriorityNotifications atendimentos={atendimentos} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainPriorityPaymentsModal;
