import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, DollarSign, FileText, Users, Star, User, ChevronDown, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useUserDataService from "@/services/userDataService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import IndividualTarotFormGenerator from "@/components/reports/IndividualTarotFormGenerator";

const RelatorioIndividualTarot = () => {
  const { getAllTarotAnalyses } = useUserDataService();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [analises] = useState(getAllTarotAnalyses());

  const clientesUnicos = useMemo(() => {
    const clientesMap = new Map();
    
    analises.forEach(analise => {
      const clienteKey = analise.nomeCliente.toLowerCase();
      if (!clientesMap.has(clienteKey)) {
        clientesMap.set(clienteKey, {
          nome: analise.nomeCliente,
          analises: []
        });
      }
      clientesMap.get(clienteKey).analises.push(analise);
    });

    return Array.from(clientesMap.values());
  }, [analises]);

  const clientesFiltrados = useMemo(() => {
    return clientesUnicos.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clientesUnicos, searchTerm]);

  const calcularTotalCliente = (analises: any[]) => {
    return analises.reduce((total, analise) => {
      const preco = parseFloat(analise.preco || "150");
      return total + preco;
    }, 0);
  };

  const totalReceita = useMemo(() => {
    return clientesUnicos.reduce((total, cliente) => {
      return total + calcularTotalCliente(cliente.analises);
    }, 0);
  }, [clientesUnicos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Logo height={50} width={50} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#673193]">
                Relatórios Individuais - Tarot
              </h1>
              <p className="text-[#673193] mt-1 opacity-80">Análises por cliente</p>
            </div>
          </div>
          <Button
            onClick={() => toast.success("Funcionalidade em desenvolvimento")}
            className="bg-[#673193] hover:bg-[#673193]/90 text-white w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Baixar PDF Geral</span>
          </Button>
        </div>

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

        <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
          <CardHeader className="border-b border-slate-200/50 pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <CardTitle className="text-xl sm:text-2xl font-bold text-[#673193]">
                  Clientes - Tarot
                </CardTitle>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 w-fit">
                  {clientesUnicos.length} clientes
                </Badge>
              </div>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="pr-10 bg-white/90 border-white/30 focus:border-[#673193] w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {clientesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-600">Nenhum cliente encontrado</h3>
                <p className="text-slate-500 mt-2">
                  {searchTerm 
                    ? "Tente ajustar sua busca" 
                    : "Nenhuma análise foi registrada ainda"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientesFiltrados.map((cliente, index) => (
                  <div key={`${cliente.nome}-${index}`} className="border border-white/20 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300 shadow-md">
                    <div className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                              <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                                {cliente.nome}
                              </h3>
                              <Badge 
                                variant="secondary"
                                className="bg-blue-100 text-blue-700 border-blue-200 w-fit"
                              >
                                {cliente.analises.length} análise{cliente.analises.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                                <span className="font-medium text-emerald-600 truncate">
                                  Total: R$ {calcularTotalCliente(cliente.analises).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                                <span className="truncate">
                                  Média: R$ {(calcularTotalCliente(cliente.analises) / cliente.analises.length).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setExpandedClient(expandedClient === cliente.nome ? null : cliente.nome)}
                              className="border-purple-600/30 text-purple-600 hover:bg-purple-600/10 text-xs sm:text-sm w-full sm:w-auto"
                            >
                              {expandedClient === cliente.nome ? 'Ocultar' : 'Ver'} Detalhes
                            </Button>
                            
                            {cliente.analises.length > 1 ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10 text-xs sm:text-sm w-full sm:w-auto"
                                  >
                                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span>Gerar Formulário</span>
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-lg">
                                  {cliente.analises.map((analise: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50">
                                      <IndividualTarotFormGenerator
                                        analise={analise}
                                        clientName={cliente.nome}
                                        className="flex-1 justify-start text-left text-xs"
                                      />
                                    </div>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <IndividualTarotFormGenerator
                                analise={cliente.analises[0]}
                                clientName={cliente.nome}
                                className="text-xs sm:text-sm w-full sm:w-auto"
                              />
                            )}
                          </div>
                        </div>

                        {expandedClient === cliente.nome && (
                          <div className="border-t border-purple-600/20 pt-4">
                            <h4 className="font-medium text-purple-600 mb-3">Histórico de Análises</h4>
                            <div className="space-y-3">
                              {cliente.analises.map((analise: any, idx: number) => (
                                <div key={idx} className="bg-purple-50/50 rounded-lg p-3 border border-purple-200/30">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm flex-1">
                                      <div>
                                        <span className="font-medium text-purple-600">Status:</span>
                                        <span className="ml-2 text-slate-700">
                                          {analise.finalizado ? 'Finalizada' : 'Em andamento'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="font-medium text-purple-600">Valor:</span>
                                        <span className="ml-2 text-slate-700">R$ {parseFloat(analise.preco || "150").toFixed(2)}</span>
                                      </div>
                                      
                                      {analise.signo && (
                                        <div>
                                          <span className="font-medium text-purple-600">Signo:</span>
                                          <span className="ml-2 text-slate-700">{analise.signo}</span>
                                        </div>
                                      )}
                                      
                                      {analise.nascimento && (
                                        <div>
                                          <span className="font-medium text-purple-600">Nascimento:</span>
                                          <span className="ml-2 text-slate-700">
                                            {new Date(analise.nascimento).toLocaleDateString('pt-BR')}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="w-full sm:w-auto">
                                      <IndividualTarotFormGenerator
                                        analise={analise}
                                        clientName={cliente.nome}
                                        className="text-xs w-full sm:w-auto"
                                      />
                                    </div>
                                  </div>

                                  {analise.pergunta && (
                                    <div className="mt-3">
                                      <span className="font-medium text-purple-600">Pergunta:</span>
                                      <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border break-words">{analise.pergunta}</p>
                                    </div>
                                  )}

                                  {analise.leitura && (
                                    <div className="mt-3">
                                      <span className="font-medium text-purple-600">Leitura:</span>
                                      <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border break-words">{analise.leitura}</p>
                                    </div>
                                  )}

                                  {analise.orientacao && (
                                    <div className="mt-3">
                                      <span className="font-medium text-purple-600">Orientação:</span>
                                      <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border break-words">{analise.orientacao}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatorioIndividualTarot;
