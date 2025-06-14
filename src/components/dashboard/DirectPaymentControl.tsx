
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

const DirectPaymentControl: React.FC = () => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const { getPlanos, savePlanos, getAtendimentos } = useUserDataService();
  const [planos, setPlanos] = useState<(PlanoMensal | PlanoSemanal)[]>([]);

  useEffect(() => {
    loadPlanos();
  }, []);

  useEffect(() => {
    const handlePlanosUpdated = () => {
      loadPlanos();
    };

    window.addEventListener('atendimentosUpdated', handlePlanosUpdated);
    
    return () => {
      window.removeEventListener('atendimentosUpdated', handlePlanosUpdated);
    };
  }, []);

  const loadPlanos = () => {
    const allPlanos = getPlanos();
    const atendimentos = getAtendimentos();
    const existingClientNames = new Set(atendimentos.map(a => a.nome));
    
    const activePlanos = allPlanos.filter((plano) => 
      (plano.type === 'plano' || plano.type === 'semanal') && 
      plano.active && 
      !plano.analysisId &&
      existingClientNames.has(plano.clientName)
    );

    setPlanos(activePlanos);
  };

  const handlePaymentToggle = (planoId: string, clientName: string, isPaid: boolean) => {
    const allPlanos = getPlanos();
    const updatedPlanos = allPlanos.map(plano => 
      plano.id === planoId ? { ...plano, active: !isPaid } : plano
    );
    
    savePlanos(updatedPlanos);
    toast.success(
      isPaid 
        ? `Pagamento de ${clientName} marcado como pago!`
        : `Pagamento de ${clientName} marcado como pendente!`
    );
    
    window.dispatchEvent(new Event('atendimentosUpdated'));
    loadPlanos();
  };

  const toggleClientExpansion = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
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

  const monthlyPlanos = planos.filter(p => p.type === 'plano');
  const weeklyPlanos = planos.filter(p => p.type === 'semanal');

  const getMonthlyClientsData = () => {
    const groupedPlanos = monthlyPlanos.reduce((acc, plano) => {
      if (!acc[plano.clientName]) acc[plano.clientName] = [];
      acc[plano.clientName].push(plano as PlanoMensal);
      return acc;
    }, {} as Record<string, PlanoMensal[]>);

    return Object.entries(groupedPlanos).map(([clientName, clientPlanos]) => {
      const totalValue = clientPlanos.reduce((sum, plano) => sum + plano.amount, 0);
      const paidValue = clientPlanos.filter(p => !p.active).reduce((sum, plano) => sum + plano.amount, 0);
      const paidCount = clientPlanos.filter(p => !p.active).length;
      const totalCount = clientPlanos.length;
      
      return {
        clientName,
        planos: clientPlanos,
        totalValue,
        paidValue,
        paidCount,
        totalCount
      };
    });
  };

  const getWeeklyClientsData = () => {
    const groupedPlanos = weeklyPlanos.reduce((acc, plano) => {
      if (!acc[plano.clientName]) acc[plano.clientName] = [];
      acc[plano.clientName].push(plano as PlanoSemanal);
      return acc;
    }, {} as Record<string, PlanoSemanal[]>);

    return Object.entries(groupedPlanos).map(([clientName, clientPlanos]) => {
      const totalValue = clientPlanos.reduce((sum, plano) => sum + plano.amount, 0);
      const paidValue = clientPlanos.filter(p => !p.active).reduce((sum, plano) => sum + plano.amount, 0);
      const paidCount = clientPlanos.filter(p => !p.active).length;
      const totalCount = clientPlanos.length;
      
      return {
        clientName,
        planos: clientPlanos,
        totalValue,
        paidValue,
        paidCount,
        totalCount
      };
    });
  };

  const monthlyClientsData = getMonthlyClientsData();
  const weeklyClientsData = getWeeklyClientsData();

  return (
    <div className="space-y-6">
      {/* Pagamentos Mensais */}
      {monthlyClientsData.map((clientData) => (
        <Card key={`monthly-${clientData.clientName}`} className="border-gray-200">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <CreditCard className="h-5 w-5" />
                Controle de Pagamentos Mensal - Vencimento todo dia 5
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-2">
                  {clientData.paidCount}/{clientData.totalCount}
                </Badge>
              </CardTitle>
              <div className="text-sm text-gray-600">
                R$ {clientData.paidValue.toFixed(2)} / R$ {clientData.totalValue.toFixed(2)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="space-y-3">
              {clientData.planos.map((plano) => {
                const isPaid = !plano.active;
                return (
                  <Button
                    key={plano.id}
                    onClick={() => handlePaymentToggle(plano.id, clientData.clientName, !isPaid)}
                    variant="outline"
                    className={`
                      w-full p-4 h-auto flex items-center justify-between
                      ${isPaid 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${isPaid ? 'bg-green-200' : 'bg-red-200'}`}>
                        {isPaid ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">
                          {plano.month}º Mês
                        </div>
                        <div className="text-sm opacity-75">
                          Vencimento: {formatDate(plano.dueDate)}
                        </div>
                      </div>
                    </div>
                    <Badge variant={isPaid ? "default" : "destructive"}>
                      {isPaid ? 'Pago' : 'Pendente'}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagamentos Semanais */}
      {weeklyClientsData.map((clientData) => (
        <Card key={`weekly-${clientData.clientName}`} className="border-gray-200">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Calendar className="h-5 w-5" />
                Controle de Pagamentos Semanal - Vencimento toda sexta-feira
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-2">
                  {clientData.paidCount}/{clientData.totalCount}
                </Badge>
              </CardTitle>
              <div className="text-sm text-gray-600">
                R$ {clientData.paidValue.toFixed(2)} / R$ {clientData.totalValue.toFixed(2)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="space-y-3">
              {clientData.planos.map((plano) => {
                const isPaid = !plano.active;
                return (
                  <Button
                    key={plano.id}
                    onClick={() => handlePaymentToggle(plano.id, clientData.clientName, !isPaid)}
                    variant="outline"
                    className={`
                      w-full p-4 h-auto flex items-center justify-between
                      ${isPaid 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${isPaid ? 'bg-green-200' : 'bg-red-200'}`}>
                        {isPaid ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">
                          {plano.week}ª Semana
                        </div>
                        <div className="text-sm opacity-75">
                          Vencimento: {formatDate(plano.dueDate)}
                        </div>
                      </div>
                    </div>
                    <Badge variant={isPaid ? "default" : "destructive"}>
                      {isPaid ? 'Pago' : 'Pendente'}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {monthlyClientsData.length === 0 && weeklyClientsData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum pagamento ativo</p>
        </div>
      )}
    </div>
  );
};

export default DirectPaymentControl;
