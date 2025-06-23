import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, DollarSign, TrendingUp, Users, Calendar, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import useUserDataService from "@/services/userDataService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { jsPDF } from 'jspdf';

const RelatoriosFinanceiros = () => {
  const { getAtendimentos } = useUserDataService();
  const isMobile = useIsMobile();
  const [atendimentos, setAtendimentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    overview: !isMobile,
    charts: !isMobile,
    details: !isMobile
  });

  useEffect(() => {
    loadAtendimentos();
  }, []);

  const loadAtendimentos = () => {
    const data = getAtendimentos();
    setAtendimentos(data);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('RELATÓRIO FINANCEIRO', 105, 30, { align: 'center' });
      
      // Date
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 20, 50);
      
      // Stats
      let yPos = 70;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('RESUMO FINANCEIRO', 20, yPos);
      
      yPos += 20;
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Recebido: R$ ${stats.totalReceitas.toFixed(2)}`, 20, yPos);
      yPos += 10;
      doc.text(`Total Pendente: R$ ${stats.totalPendente.toFixed(2)}`, 20, yPos);
      yPos += 10;
      doc.text(`Total Parcelado: R$ ${stats.totalParcelado.toFixed(2)}`, 20, yPos);
      yPos += 10;
      doc.text(`Total de Clientes: ${stats.totalClientes}`, 20, yPos);
      yPos += 10;
      doc.text(`Total de Atendimentos: ${stats.totalAtendimentos}`, 20, yPos);
      
      // Atendimentos table
      yPos += 30;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('DETALHES DOS ATENDIMENTOS', 20, yPos);
      
      yPos += 20;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Cliente', 20, yPos);
      doc.text('Serviço', 60, yPos);
      doc.text('Data', 120, yPos);
      doc.text('Valor', 150, yPos);
      doc.text('Status', 180, yPos);
      
      yPos += 10;
      doc.setFont(undefined, 'normal');
      
      filteredAtendimentos.slice(0, 20).forEach((atendimento) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;
        }
        
        doc.text(atendimento.nome?.substring(0, 15) || '', 20, yPos);
        doc.text(atendimento.tipoServico?.substring(0, 15) || '', 60, yPos);
        doc.text(new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR'), 120, yPos);
        doc.text(`R$ ${parseFloat(atendimento.valor || "0").toFixed(2)}`, 150, yPos);
        doc.text(atendimento.statusPagamento || '', 180, yPos);
        yPos += 8;
      });
      
      doc.save(`Relatorio_Financeiro_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar relatório PDF");
    }
  };

  const filteredAtendimentos = useMemo(() => {
    return atendimentos.filter(atendimento => {
      const matchesSearch = atendimento.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const atendimentoDate = new Date(atendimento.dataAtendimento);
      const matchesYear = atendimentoDate.getFullYear().toString() === selectedYear;
      const matchesMonth = selectedMonth === 'all' || (atendimentoDate.getMonth() + 1).toString() === selectedMonth;
      
      return matchesSearch && matchesYear && matchesMonth;
    });
  }, [atendimentos, searchTerm, selectedYear, selectedMonth]);

  const stats = useMemo(() => {
    const totalReceitas = filteredAtendimentos
      .filter(a => a.statusPagamento === 'pago')
      .reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);

    const totalPendente = filteredAtendimentos
      .filter(a => a.statusPagamento === 'pendente')
      .reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);

    const totalParcelado = filteredAtendimentos
      .filter(a => a.statusPagamento === 'parcelado')
      .reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);

    const totalClientes = new Set(filteredAtendimentos.map(a => a.nome)).size;

    return {
      totalReceitas,
      totalPendente,
      totalParcelado,
      totalClientes,
      totalAtendimentos: filteredAtendimentos.length
    };
  }, [filteredAtendimentos]);

  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: { month: string; pago: number; pendente: number; parcelado: number } } = {};
    
    filteredAtendimentos.forEach(atendimento => {
      const date = new Date(atendimento.dataAtendimento);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, pago: 0, pendente: 0, parcelado: 0 };
      }
      
      const valor = parseFloat(atendimento.valor || "0");
      monthlyData[monthKey][atendimento.statusPagamento] += valor;
    });

    return Object.values(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.month.split('/').map(Number);
      const [monthB, yearB] = b.month.split('/').map(Number);
      return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
    });
  }, [filteredAtendimentos]);

  const serviceData = useMemo(() => {
    const services = {};
    
    filteredAtendimentos.forEach(atendimento => {
      const service = atendimento.tipoServico || 'Não especificado';
      if (!services[service]) {
        services[service] = { name: service, value: 0, count: 0 };
      }
      services[service].value += parseFloat(atendimento.valor || "0");
      services[service].count += 1;
    });

    return Object.values(services);
  }, [filteredAtendimentos]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const years = Array.from(new Set(atendimentos.map(a => new Date(a.dataAtendimento).getFullYear())))
    .sort((a, b) => b - a);

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DashboardHeader />
      
      <main className="container mx-auto py-20 sm:py-24 px-2 sm:px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Relatórios Financeiros
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Análise detalhada das receitas e pagamentos
              </p>
            </div>
            <Button
              onClick={downloadPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              <span>Baixar PDF</span>
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedMonth('all');
                setSelectedYear(new Date().getFullYear().toString());
              }}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <Collapsible 
          open={expandedSections.overview} 
          onOpenChange={() => toggleSection('overview')}
        >
          <CollapsibleTrigger asChild>
            <Card className="mb-6 cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Resumo Financeiro
                  </CardTitle>
                  <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.overview ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs sm:text-sm">Total Recebido</p>
                      <p className="text-lg sm:text-2xl font-bold">R$ {stats.totalReceitas.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-xs sm:text-sm">Pendente</p>
                      <p className="text-lg sm:text-2xl font-bold">R$ {stats.totalPendente.toFixed(2)}</p>
                    </div>
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-xs sm:text-sm">Parcelado</p>
                      <p className="text-lg sm:text-2xl font-bold">R$ {stats.totalParcelado.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs sm:text-sm">Clientes</p>
                      <p className="text-lg sm:text-2xl font-bold">{stats.totalClientes}</p>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs sm:text-sm">Atendimentos</p>
                      <p className="text-lg sm:text-2xl font-bold">{stats.totalAtendimentos}</p>
                    </div>
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-100" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Charts Section */}
        <Collapsible 
          open={expandedSections.charts} 
          onOpenChange={() => toggleSection('charts')}
        >
          <CollapsibleTrigger asChild>
            <Card className="mb-6 cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Análise Gráfica
                  </CardTitle>
                  <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.charts ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Receitas por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          fontSize={isMobile ? 10 : 12}
                          angle={isMobile ? -45 : 0}
                          textAnchor={isMobile ? 'end' : 'middle'}
                          height={isMobile ? 60 : 30}
                        />
                        <YAxis fontSize={isMobile ? 10 : 12} />
                        <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']} />
                        <Legend fontSize={isMobile ? 10 : 12} />
                        <Bar dataKey="pago" fill="#10B981" name="Pago" />
                        <Bar dataKey="pendente" fill="#F59E0B" name="Pendente" />
                        <Bar dataKey="parcelado" fill="#F97316" name="Parcelado" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Receita por Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={isMobile ? 60 : 80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']} />
                        <Legend fontSize={isMobile ? 10 : 12} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Details Table */}
        <Collapsible 
          open={expandedSections.details} 
          onOpenChange={() => toggleSection('details')}
        >
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Detalhes dos Atendimentos
                  </CardTitle>
                  <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.details ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-700">Cliente</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-700">Serviço</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-700">Data</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-700">Valor</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAtendimentos.map((atendimento, index) => (
                        <tr key={atendimento.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 sm:p-4 text-xs sm:text-sm">{atendimento.nome}</td>
                          <td className="p-3 sm:p-4 text-xs sm:text-sm">{atendimento.tipoServico}</td>
                          <td className="p-3 sm:p-4 text-xs sm:text-sm">
                            {new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-green-600">
                            R$ {parseFloat(atendimento.valor || "0").toFixed(2)}
                          </td>
                          <td className="p-3 sm:p-4">
                            <Badge 
                              variant={atendimento.statusPagamento === 'pago' ? 'default' : 'secondary'}
                              className={`text-xs ${
                                atendimento.statusPagamento === 'pago' 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : atendimento.statusPagamento === 'pendente'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : 'bg-orange-100 text-orange-800 border-orange-200'
                              }`}
                            >
                              {atendimento.statusPagamento}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredAtendimentos.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Nenhum atendimento encontrado</p>
                    <p className="text-sm mt-2">Ajuste os filtros para ver os resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </main>
    </div>
  );
};

export default RelatoriosFinanceiros;
