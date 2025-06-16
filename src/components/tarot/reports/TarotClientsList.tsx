
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText } from "lucide-react";
import TarotClientCard from "./TarotClientCard";

interface TarotClientsListProps {
  clientesFiltrados: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  expandedClient: string | null;
  setExpandedClient: (client: string | null) => void;
}

const TarotClientsList: React.FC<TarotClientsListProps> = ({
  clientesFiltrados,
  searchTerm,
  setSearchTerm,
  expandedClient,
  setExpandedClient
}) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
      <CardHeader className="border-b border-slate-200/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-xl sm:text-2xl font-bold text-[#673193]">
              Clientes - Tarot
            </CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 w-fit">
              {clientesFiltrados.length} clientes
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
              <TarotClientCard
                key={`${cliente.nome}-${index}`}
                cliente={cliente}
                expandedClient={expandedClient}
                setExpandedClient={setExpandedClient}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TarotClientsList;
