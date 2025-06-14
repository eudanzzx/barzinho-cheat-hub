
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  CreditCard,
  Check,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const MainPaymentPlansList: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState("todos");
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
    try {
      const allPlanos = getPlanos();
      const atendimentos = getAtendimentos();
      const existingClientNames = new Set(atendimentos.map(a => a.nome));
      
      const activePlanos = allPlanos.filter(plano => 
        plano.active && 
        !plano.analysisId &&
        existingClientNames.has(plano.clientName)
      );

      setPlanos(activePlanos);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      setPlanos([]);
    }
  };

  const handlePaymentToggle = (planoId: string, clientName: string, isPaid: boolean) => {
    try {
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
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast.error('Erro ao atualizar pagamento');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getDaysOverdue = (dueDate: string) => {
    try {
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = today.getTime() - due.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  const filteredPlanos = useMemo(() => {
    let filtered = planos.filter(plano =>
      plano.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch(activeTab) {
      case "mensais":
        filtered = filtered.filter(plano => plano.type === 'plano');
        break;
      case "semanais":
        filtered = filtered.filter(plano => plano.type === 'semanal');
        break;
      case "atrasados":
        filtered = filtered.filter(plano => {
          const daysOverdue = getDaysOverdue(plano.dueDate);
          return daysOverdue > 0;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [planos, searchTerm, activeTab]);

  const getTabCounts = () => {
    const mensais = planos.filter(p => p.type === 'plano').length;
    const semanais = planos.filter(p => p.type === 'semanal').length;
    const atrasados = planos.filter(p => {
      const daysOverdue = getDaysOverdue(p.dueDate);
      return daysOverdue > 0;
    }).length;
    return { mensais, semanais, atrasados };
  };

  const { mensais, semanais, atrasados } = getTabCounts();

  return (
    <div className="w-full mb-8">
      <Card className="border border-gray-200 shadow-sm">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Planos de Pagamento</h2>
                    <p className="text-sm text-gray-600 font-normal">
                      Gerencie os pagamentos dos seus clientes
                    </p>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    {planos.length} plano(s)
                  </Badge>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-gray-500 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )} />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Buscar cliente..." 
                    className="pl-10 border-gray-300 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-50 mb-6">
                  <TabsTrigger value="todos">
                    Todos ({planos.length})
                  </TabsTrigger>
                  <TabsTrigger value="mensais">
                    Mensais ({mensais})
                  </TabsTrigger>
                  <TabsTrigger value="semanais">
                    Semanais ({semanais})
                  </TabsTrigger>
                  <TabsTrigger value="atrasados">
                    Atrasados ({atrasados})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                  {filteredPlanos.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border">
                      <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        {planos.length === 0 ? 'Nenhum plano encontrado' : 'Nenhum resultado'}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {searchTerm 
                          ? "Tente ajustar sua busca ou limpar o filtro"
                          : "Os planos aparecerão aqui quando houver pagamentos ativos"
                        }
                      </p>
                      
                      {searchTerm && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setSearchTerm('')}
                        >
                          Limpar Busca
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPlanos.map((plano) => {
                        const daysOverdue = getDaysOverdue(plano.dueDate);
                        const isOverdue = daysOverdue > 0;
                        const isPaid = !plano.active;
                        const isMonthly = plano.type === 'plano';
                        
                        return (
                          <Card 
                            key={plano.id} 
                            className={cn(
                              "border-l-4 transition-all duration-200 hover:shadow-md",
                              isPaid 
                                ? "border-l-green-500 bg-green-50"
                                : isOverdue
                                ? "border-l-red-500 bg-red-50"
                                : "border-l-blue-500 bg-blue-50"
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="font-semibold text-gray-900">
                                      {plano.clientName}
                                    </h3>
                                    <Badge variant="outline" className="text-xs">
                                      {isMonthly ? `${(plano as PlanoMensal).month}º Mês` : `${(plano as PlanoSemanal).week}ª Semana`}
                                    </Badge>
                                    <Badge 
                                      variant="secondary"
                                      className={cn(
                                        "text-xs",
                                        isMonthly ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                                      )}
                                    >
                                      {isMonthly ? "Mensal" : "Semanal"}
                                    </Badge>
                                    {isOverdue && !isPaid && (
                                      <Badge variant="destructive" className="text-xs">
                                        {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrasado
                                      </Badge>
                                    )}
                                    {isPaid && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        ✓ Pago
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">Valor:</span>
                                      <span className="ml-1 font-semibold text-green-600">
                                        R$ {plano.amount.toFixed(2)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Vencimento:</span>
                                      <span className="ml-1">{formatDate(plano.dueDate)}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handlePaymentToggle(plano.id, plano.clientName, !isPaid)}
                                  size="sm"
                                  className={cn(
                                    "transition-all duration-200 ml-4",
                                    isPaid
                                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                                      : "bg-green-500 hover:bg-green-600 text-white"
                                  )}
                                >
                                  {isPaid ? (
                                    <>
                                      <X className="h-4 w-4 mr-1" />
                                      Pendente
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      Pagar
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default MainPaymentPlansList;
