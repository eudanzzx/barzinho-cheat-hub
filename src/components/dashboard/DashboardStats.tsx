import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import PeriodDropdown from "@/components/dashboard/PeriodDropdown";

interface DashboardStatsProps {
  totalAtendimentos: number;
  atendimentosSemana: number;
  totalRecebido: number;
  totalRecebidoSemana: number;
  totalRecebidoMes: number;
  totalRecebidoAno: number;
  selectedPeriod: 'semana' | 'mes' | 'ano' | 'total';
  onPeriodChange: (period: 'semana' | 'mes' | 'ano' | 'total') => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = React.memo(({
  totalAtendimentos,
  atendimentosSemana,
  totalRecebido,
  totalRecebidoSemana,
  totalRecebidoMes,
  totalRecebidoAno,
  selectedPeriod,
  onPeriodChange
}) => {
  const getRecebidoValue = () => {
    switch (selectedPeriod) {
      case 'semana': return totalRecebidoSemana;
      case 'mes': return totalRecebidoMes;
      case 'ano': return totalRecebidoAno;
      default: return totalRecebido;
    }
  };

  const stats = [
    {
      title: 'Recebido',
      value: `R$ ${getRecebidoValue().toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      showDropdown: false // removendo o dropdown do card
    },
    {
      title: 'Total de Atendimentos',
      value: totalAtendimentos.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Atendimentos (Semana)',
      value: atendimentosSemana.toString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  return (
    <>
      {/* Dropdown principal bonito e elegante */}
      <div className="flex justify-start mb-2">
        <div className="w-fit">
          {/* Exibir dropdown aqui no visual principal */}
          <PeriodDropdown
            selectedPeriod={selectedPeriod}
            onPeriodChange={onPeriodChange}
            variant="main" // Define visual principal grande/azul
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className={`${stat.bgColor} ${stat.borderColor} border-2 shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    {/* Removido o PeriodDropdown daqui */}
                  </div>
                  <p className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;
