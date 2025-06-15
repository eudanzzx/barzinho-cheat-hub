import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTarotAnalises } from "@/hooks/useTarotAnalises";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import TarotCounterPriorityNotifications from "@/components/TarotCounterPriorityNotifications";

function AnaliseFrequencial() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    analises,
    setAnalises,
    filteredAnalises,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    tabAnalises,
    selectedPeriod,
    handlePeriodChange,
    aniversarianteHoje,
    recebidoStats,
    getStatusCounts,
    calculaStatsRecebido,
    handleDelete,
    handleToggleFinished,
    reloadAnalises,
  } = useTarotAnalises();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* TarotCounterPriorityNotifications removido daqui */}
      {/* <TarotCounterPriorityNotifications analises={analises} /> */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Listagem de Análises Frequenciais</h1>
          <p className="text-sm text-gray-500">
            Gerencie e acompanhe as análises de seus clientes.
          </p>
        </div>
        <Button onClick={() => navigate("/nova-analise")}>
          Nova Análise Frequencial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {recebidoStats[selectedPeriod].toFixed(2)}
            </div>
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePeriodChange("total")}
                className={cn(
                  selectedPeriod === "total"
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : ""
                )}
              >
                Total
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePeriodChange("ano")}
                className={cn(
                  selectedPeriod === "ano"
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : ""
                )}
              >
                Este Ano
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePeriodChange("mes")}
                className={cn(
                  selectedPeriod === "mes"
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : ""
                )}
              >
                Este Mês
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePeriodChange("semana")}
                className={cn(
                  selectedPeriod === "semana"
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : ""
                )}
              >
                Esta Semana
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aniversariante do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {aniversarianteHoje ? (
              <>
                <div className="text-lg font-semibold">
                  {aniversarianteHoje.nome}
                </div>
                <div className="text-sm text-gray-500">
                  Data de Nascimento:{" "}
                  {format(new Date(aniversarianteHoje.dataNascimento), "dd 'de' MMMM", {
                    locale: ptBR,
                  })}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Nenhum hoje!</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Análises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span>Finalizadas:</span>
                <Badge variant="default">{getStatusCounts().finalizados}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Em Andamento:</span>
                <Badge variant="secondary">{getStatusCounts().emAndamento}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Em Atenção:</span>
                <Badge variant="destructive">{getStatusCounts().atencao}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Análises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analises.length}</div>
            <div className="text-sm text-gray-500">
              Número total de análises cadastradas.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <Input
          type="search"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-4 flex space-x-2">
        <Button
          variant={activeTab === "todas" ? "default" : "outline"}
          onClick={() => setActiveTab("todas")}
        >
          Todas
        </Button>
        <Button
          variant={activeTab === "pendentes" ? "default" : "outline"}
          onClick={() => setActiveTab("pendentes")}
        >
          Em Andamento
        </Button>
        <Button
          variant={activeTab === "finalizadas" ? "default" : "outline"}
          onClick={() => setActiveTab("finalizadas")}
        >
          Finalizadas
        </Button>
        <Button
          variant={activeTab === "atencao" ? "default" : "outline"}
          onClick={() => setActiveTab("atencao")}
        >
          Em Atenção
        </Button>
      </div>

      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Valor (R$)</TableHead>
              <TableHead className="text-center">Finalizado</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tabAnalises.map((analise) => (
              <TableRow key={analise.id}>
                <TableCell>{analise.client.name}</TableCell>
                <TableCell>
                  {format(new Date(analise.startDate), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>{analise.treatmentDays} dias</TableCell>
                <TableCell>{analise.price}</TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={analise.finalizado}
                    onCheckedChange={() => handleToggleFinished(analise.id)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/editar-analise/${analise.id}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      handleDelete(analise.id);
                      toast({
                        title: "Análise deletada!",
                        description: "Essa análise foi removida do sistema.",
                      });
                    }}
                  >
                    Deletar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
export default AnaliseFrequencial;
