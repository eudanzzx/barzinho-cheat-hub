
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, BarChart3, Users } from 'lucide-react';

interface RelatorioIndividualStatsProps {
  totalValue: string;
  totalConsultas: number;
  totalClientes: number;
}

const DashboardCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
      <div className="flex justify-between items-center">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-lg sm:text-3xl font-bold text-slate-800 truncate">{value}</p>
        </div>
        <div className="rounded-xl p-2 sm:p-3 bg-blue-600/10 flex-shrink-0">
          {React.cloneElement(icon as React.ReactElement, { 
            className: "h-5 w-5 sm:h-8 sm:w-8 text-blue-600" 
          })}
        </div>
      </div>
    </CardContent>
  </Card>
);

const RelatorioIndividualStats: React.FC<RelatorioIndividualStatsProps> = ({
  totalValue,
  totalConsultas,
  totalClientes
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <DashboardCard 
        title="Total Arrecadado" 
        value={`R$ ${totalValue}`} 
        icon={<DollarSign />} 
      />
      <DashboardCard 
        title="Total Consultas" 
        value={totalConsultas.toString()} 
        icon={<BarChart3 />} 
      />
      <DashboardCard 
        title="Clientes Únicos" 
        value={totalClientes.toString()} 
        icon={<Users />} 
      />
    </div>
  );
};

export default RelatorioIndividualStats;
