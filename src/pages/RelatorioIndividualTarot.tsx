
import React, { useState, useMemo } from 'react';
import useUserDataService from "@/services/userDataService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import TarotReportHeader from "@/components/tarot/reports/TarotReportHeader";
import TarotReportStats from "@/components/tarot/reports/TarotReportStats";
import TarotClientsList from "@/components/tarot/reports/TarotClientsList";

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

  const totalReceita = useMemo(() => {
    return clientesUnicos.reduce((total, cliente) => {
      const clienteTotal = cliente.analises.reduce((sum, analise) => {
        const preco = parseFloat(analise.preco || "150");
        return sum + preco;
      }, 0);
      return total + clienteTotal;
    }, 0);
  }, [clientesUnicos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
      <DashboardHeader />
      
      <main className="container mx-auto py-24 px-4">
        <TarotReportHeader />

        <TarotReportStats 
          clientesUnicos={clientesUnicos}
          analises={analises}
          totalReceita={totalReceita}
        />

        <TarotClientsList
          clientesFiltrados={clientesFiltrados}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          expandedClient={expandedClient}
          setExpandedClient={setExpandedClient}
        />
      </main>
    </div>
  );
};

export default RelatorioIndividualTarot;
