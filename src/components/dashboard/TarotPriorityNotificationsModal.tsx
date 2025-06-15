
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TarotCounterPriorityNotifications from "@/components/TarotCounterPriorityNotifications";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTarotAnalises } from "@/hooks/useTarotAnalises";

interface TarotPriorityNotificationsModalProps {
  triggerButtonClassName?: string;
}

const TarotPriorityNotificationsModal: React.FC<TarotPriorityNotificationsModalProps> = ({
  triggerButtonClassName = '',
}) => {
  const { analises } = useTarotAnalises();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center text-purple-700 hover:bg-purple-100 hover:text-purple-900 font-semibold ${triggerButtonClassName}`}
        >
          <Bell className="mr-2" />
          Próximos Vencimentos - Análises de Tarot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl w-full">
        <DialogHeader>
          <DialogTitle className="text-purple-800 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Próximos Vencimentos - Análises de Tarot
          </DialogTitle>
        </DialogHeader>
        <TarotCounterPriorityNotifications analises={analises} />
      </DialogContent>
    </Dialog>
  );
};

export default TarotPriorityNotificationsModal;
