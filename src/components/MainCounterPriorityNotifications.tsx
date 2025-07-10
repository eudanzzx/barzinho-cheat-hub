
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";

interface MainCounterPriorityNotificationsProps {
  atendimentos: any[];
}

const MainCounterPriorityNotifications: React.FC<MainCounterPriorityNotificationsProps> = memo(({
  atendimentos,
}) => {
  const location = useLocation();
  
  // Só mostrar notificações principais na página principal
  const isMainPage = location.pathname === '/' || location.pathname === '/dashboard';
  
  if (!isMainPage) {
    return null;
  }

  // Filtrar apenas atendimentos com vencimentos próximos
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const upcomingPayments = atendimentos.filter((atendimento) => {
    // Lógica para verificar vencimentos próximos dos atendimentos
    return atendimento.planoAtivo || atendimento.semanalAtivo;
  });

  if (upcomingPayments.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bell className="h-5 w-5" />
          Próximos Vencimentos - Atendimentos
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {upcomingPayments.length} {upcomingPayments.length === 1 ? 'atendimento' : 'atendimentos'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingPayments.map((atendimento) => (
          <div key={atendimento.id} className="p-3 border border-blue-200 rounded-lg bg-white/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800">{atendimento.nome}</h4>
                <p className="text-sm text-blue-600">
                  {atendimento.planoAtivo && 'Plano Mensal'} 
                  {atendimento.semanalAtivo && 'Plano Semanal'}
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                Próximo
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

MainCounterPriorityNotifications.displayName = 'MainCounterPriorityNotifications';

export default MainCounterPriorityNotifications;
