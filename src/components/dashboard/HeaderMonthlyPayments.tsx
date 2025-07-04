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
import { PlanoMensal } from "@/types/payment";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const HeaderMonthlyPayments: React.FC = () => {
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [groupedPlanos, setGroupedPlanos] = useState<{[key: string]: PlanoMensal[]}>({});

  useEffect(() => {
    loadPendingPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      loadPendingPlanos();
    };

    window.addEventListener('planosUpdated', handlePlanosUpdated);
    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    window.addEventListener('monthlyPaymentsUpdated', handlePlanosUpdated); // Sincronização com MonthlyPaymentControl
    
    return () => {
      window.removeEventListener('planosUpdated', handlePlanosUpdated);
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
      window.removeEventListener('monthlyPaymentsUpdated', handlePlanosUpdated);
    };
  }, []);

  const loadPendingPlanos = () => {
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    // Filtrar apenas planos mensais ativos, criados pelo usuário e de clientes existentes
    const pendingMonthlyPlanos = allPlanos
      .filter((plano): plano is PlanoMensal => {
        return plano.type === 'plano' && 
               plano.active === true && 
               existingClientNames.has(plano.clientName) &&
               !plano.analysisId;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    // Agrupar por cliente e manter apenas o mais próximo do vencimento
    const grouped = pendingMonthlyPlanos.reduce((acc, plano) => {
      if (!acc[plano.clientName]) {
        acc[plano.clientName] = [];
      }
      acc[plano.clientName].push(plano);
      return acc;
    }, {} as {[key: string]: PlanoMensal[]});
    
    setGroupedPlanos(grouped);
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
    toast.success(`Pagamento mensal de ${clientName} marcado como pago!`);
    
    setTimeout(() => {
      loadPendingPlanos();
      window.dispatchEvent(new Event('planosUpdated'));
      window.dispatchEvent(new Event('monthlyPaymentsUpdated')); // Notificar MonthlyPaymentControl
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

  const clientNames = Object.keys(groupedPlanos);
  if (clientNames.length === 0) {
    return null;
  }

  // Encontrar o pagamento mais prioritário entre todos os clientes
  const allPriorityPlanos = clientNames.map(clientName => groupedPlanos[clientName][0]);
  const priorityPlano = allPriorityPlanos.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  const daysOverdue = getDaysOverdue(priorityPlano.dueDate);
  const isOverdue = daysOverdue > 0;
  const totalPendingPayments = allPriorityPlanos.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-1 sm:gap-2 border-purple-200 hover:bg-purple-50 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9",
            isOverdue && "border-red-200 bg-red-50 hover:bg-red-100"
          )}
        >
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">Mensal</span>
            <span className="text-xs text-gray-600 hidden sm:block truncate max-w-[80px]">
              {priorityPlano.clientName}
            </span>
          </div>
          <Badge 
            variant={isOverdue ? "destructive" : "secondary"}
            className="text-xs h-4 w-4 flex items-center justify-center p-0 min-w-[16px]"
          >
            {totalPendingPayments}
          </Badge>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 sm:w-80 bg-white border shadow-lg z-[60]">
        {/* Pagamento Prioritário */}
        <div className={cn(
          "p-3 border-b",
          isOverdue ? "bg-red-50 border-red-200" : "bg-purple-50 border-purple-200"
        )}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {priorityPlano.clientName}
              </p>
              <p className="text-xs text-gray-600">
                {priorityPlano.month}º Mês • R$ {priorityPlano.amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Vence: {formatDate(priorityPlano.dueDate)}
              </p>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs mt-1">
                  {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrasado
                </Badge>
              )}
            </div>
            <Button
              onClick={() => handlePaymentToggle(priorityPlano.id, priorityPlano.clientName)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-7 ml-2 flex-shrink-0"
            >
              <Check className="h-3 w-3 mr-1" />
              Pagar
            </Button>
          </div>
        </div>

        {/* Outros Clientes */}
        {clientNames.length > 1 && (
          <div className="max-h-60 overflow-y-auto">
            <div className="p-2 bg-gray-50 border-b">
              <p className="text-xs font-medium text-gray-700">Outros pagamentos mensais</p>
            </div>
            {clientNames
              .filter(clientName => clientName !== priorityPlano.clientName)
              .map((clientName) => {
                const clientPlano = groupedPlanos[clientName][0];
                const clientDaysOverdue = getDaysOverdue(clientPlano.dueDate);
                const clientIsOverdue = clientDaysOverdue > 0;
                
                return (
                  <DropdownMenuItem key={clientPlano.id} className="p-0">
                    <div className="w-full p-3 flex items-start justify-between hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {clientPlano.clientName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {clientPlano.month}º Mês • R$ {clientPlano.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(clientPlano.dueDate)}
                        </p>
                        {clientIsOverdue && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            {clientDaysOverdue} {clientDaysOverdue === 1 ? 'dia' : 'dias'} atrasado
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaymentToggle(clientPlano.id, clientPlano.clientName);
                        }}
                        size="sm"
                        variant="outline"
                        className="ml-2 text-xs px-2 py-1 h-7 flex-shrink-0 hover:bg-green-50 hover:border-green-300"
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

export default HeaderMonthlyPayments;
