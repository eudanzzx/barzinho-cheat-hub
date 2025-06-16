
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, DollarSign, Calendar } from "lucide-react";

interface TarotReportStatsProps {
  clientesUnicos: any[];
  analises: any[];
  totalReceita: number;
}

const TarotReportStats: React.FC<TarotReportStatsProps> = ({
  clientesUnicos,
  analises,
  totalReceita
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
        <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Clientes</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-800">{clientesUnicos.length}</p>
            </div>
            <div className="rounded-xl p-2 sm:p-3 bg-[#673193]/10 flex-shrink-0">
              <Users className="h-5 w-5 sm:h-8 sm:w-8 text-[#673193]" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
        <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Análises</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-800">{analises.length}</p>
            </div>
            <div className="rounded-xl p-2 sm:p-3 bg-[#673193]/10 flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-8 sm:w-8 text-[#673193]" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
        <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Receita Total</p>
              <p className="text-lg sm:text-3xl font-bold text-slate-800">R$ {totalReceita.toFixed(2)}</p>
            </div>
            <div className="rounded-xl p-2 sm:p-3 bg-[#673193]/10 flex-shrink-0">
              <DollarSign className="h-5 w-5 sm:h-8 sm:w-8 text-[#673193]" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
        <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Ticket Médio</p>
              <p className="text-lg sm:text-3xl font-bold text-slate-800">
                R$ {clientesUnicos.length > 0 ? (totalReceita / clientesUnicos.length).toFixed(2) : "0.00"}
              </p>
            </div>
            <div className="rounded-xl p-2 sm:p-3 bg-[#673193]/10 flex-shrink-0">
              <Calendar className="h-5 w-5 sm:h-8 sm:w-8 text-[#673193]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TarotReportStats;
