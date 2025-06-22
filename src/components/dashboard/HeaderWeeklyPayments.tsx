
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import useUserDataService from "@/services/userDataService";
import { PlanoSemanal } from "@/types/payment";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const HeaderWeeklyPayments: React.FC = () => {
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [pendingPlanos, setPendingPlanos] = useState<PlanoSemanal[]>([]);

  useEffect(() => {
    loadPendingPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      loadPendingPlanos();
    };

    window.addEventListener('planosUpdated', handlePlanosUpdated);
    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('planosUpdated', handlePlanosUpdated);
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
    };
  }, []);

  const loadPendingPlanos = () => {
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    const pendingWeeklyPlanos = allPlanos
      .filter((plano): plano is PlanoSemanal => {
        return plano.type === 'semanal' && 
               plano.active === true && 
               existingClientNames.has(plano.clientName) &&
               !plano.analysisId;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    setPendingPlanos(pendingWeeklyPlanos);
  };

  const handlePaymentToggle = (planoId: string, clientName: string) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => {
      if (plano.id === planoId) {
        return { ...plano, active: false };
      }
      return plano;
    });
    
    savePlanos(updatedPlanos);
    toast.success(`Pagamento semanal de ${clientName} marcado como pago!`);
    
    setTimeout(() => {
      loadPendingPlanos();
      window.dispatchEvent(new Event('planosUpdated'));
    }, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (pendingPlanos.length === 0) {
    return null;
  }

  const priorityPlano = pendingPlanos[0];
  const otherPlanos = pendingPlanos.slice(1);
  const daysOverdue = getDaysOverdue(priorityPlano.dueDate);
  const isOverdue = daysOverdue > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 border-blue-200 hover:bg-blue-50",
            isOverdue && "border-red-200 bg-red-50 hover:bg-red-100"
          )}
        >
          <Calendar className="h-4 w-4" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">Semanal</span>
            <span className="text-xs text-gray-600">
              {priorityPlano.clientName}
            </span>
          </div>
          <Badge 
            variant={isOverdue ? "destructive" : "secondary"}
            className="text-xs"
          >
            {pendingPlanos.length}
          </Badge>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 bg-white border shadow-lg z-[60]">
        {/* Pagamento Prioritário */}
        <div className={cn(
          "p-3 border-b",
          isOverdue ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium text-sm">{priorityPlano.clientName}</p>
              <p className="text-xs text-gray-600">
                {priorityPlano.week}ª Semana - R$ {priorityPlano.amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Vence em: {formatDate(priorityPlano.dueDate)}
              </p>
            </div>
            <Button
              onClick={() => handlePaymentToggle(priorityPlano.id, priorityPlano.clientName)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-3 w-3 mr-1" />
              Pagar
            </Button>
          </div>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrasado
            </Badge>
          )}
        </div>

        {/* Outros Pagamentos */}
        {otherPlanos.length > 0 && (
          <div className="max-h-60 overflow-y-auto">
            {otherPlanos.map((plano) => {
              const planoDaysOverdue = getDaysOverdue(plano.dueDate);
              const planoIsOverdue = planoDaysOverdue > 0;
              
              return (
                <DropdownMenuItem key={plano.id} className="p-0">
                  <div className="w-full p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{plano.clientName}</p>
                      <p className="text-xs text-gray-600">
                        {plano.week}ª Semana - R$ {plano.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(plano.dueDate)}
                      </p>
                      {planoIsOverdue && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          {planoDaysOverdue} {planoDaysOverdue === 1 ? 'dia' : 'dias'} atrasado
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePaymentToggle(plano.id, plano.clientName);
                      }}
                      size="sm"
                      variant="outline"
                      className="ml-2"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderWeeklyPayments;
