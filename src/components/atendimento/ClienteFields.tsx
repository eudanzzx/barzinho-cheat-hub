
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  nome: string;
  setNome: (val: string) => void;
  dataNascimento: string;
  handleDataNascimentoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  signo: string;
  telefone: string;
  setTelefone: (val: string) => void;
  tipoServico: string;
  setTipoServico: (val: string) => void;
  dataAtendimento: string;
  setDataAtendimento: (val: string) => void;
  valor: string;
  setValor: (val: string) => void;
  destino: string;
  setDestino: (val: string) => void;
  cidade: string;
  setCidade: (val: string) => void;
  ano: string;
  setAno: (val: string) => void;
  statusPagamento: string;
  setStatusPagamento: (val: string) => void;
  getStatusColor: (status: string) => string;
};

const ClienteFields = ({
  nome,
  setNome,
  dataNascimento,
  handleDataNascimentoChange,
  signo,
  telefone,
  setTelefone,
  tipoServico,
  setTipoServico,
  dataAtendimento,
  setDataAtendimento,
  valor,
  setValor,
  destino,
  setDestino,
  cidade,
  setCidade,
  ano,
  setAno,
  statusPagamento,
  setStatusPagamento,
  getStatusColor,
}: Props) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="nome" className="text-slate-700">Nome do Cliente</Label>
      <Input id="nome" placeholder="Nome completo" value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="dataNascimento" className="text-slate-700">Data de Nascimento</Label>
      <Input id="dataNascimento" type="date" value={dataNascimento}
        onChange={handleDataNascimentoChange}
        className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="signo" className="text-slate-700">Signo</Label>
      <Input id="signo" value={signo} readOnly className="bg-slate-50 border-slate-200" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="telefone" className="text-slate-700">Telefone</Label>
      <Input id="telefone" placeholder="(00) 00000-0000" value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="tipoServico" className="text-slate-700">Tipo de Serviço</Label>
      <Select value={tipoServico}
        onValueChange={setTipoServico}>
        <SelectTrigger className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200">
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-200">
          <SelectItem value="tarot">Tarot</SelectItem>
          <SelectItem value="terapia">Terapia</SelectItem>
          <SelectItem value="mesa-radionica">Mesa Radionica</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="dataAtendimento" className="text-slate-700">Data do Atendimento</Label>
      <Input id="dataAtendimento" type="date" value={dataAtendimento}
        onChange={(e) => setDataAtendimento(e.target.value)}
        className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="valor" className="text-slate-700">Valor Cobrado (R$)</Label>
      <Input id="valor" type="number" placeholder="0.00" value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="statusPagamento" className="text-slate-700">Status de Pagamento</Label>
      <Select value={statusPagamento} onValueChange={setStatusPagamento}>
        <SelectTrigger className={`bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200 ${statusPagamento ? `border-2 ${getStatusColor(statusPagamento)}` : ""}`}>
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-200">
          <SelectItem value="pago" className="bg-green-100 text-green-800 hover:bg-green-200">Pago</SelectItem>
          <SelectItem value="pendente" className="bg-orange-100 text-orange-800 hover:bg-orange-200">Pendente</SelectItem>
          <SelectItem value="parcelado" className="bg-red-100 text-red-800 hover:bg-red-200">Parcelado</SelectItem>
        </SelectContent>
      </Select>
      {statusPagamento && (
        <div className={`mt-2 px-3 py-1 rounded-md text-sm flex items-center ${getStatusColor(statusPagamento)}`}>
          <span className={`h-3 w-3 rounded-full mr-2 bg-white`}></span>
          <span className="capitalize">{statusPagamento}</span>
        </div>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor="destino" className="text-slate-700">Destino</Label>
      <Input id="destino" placeholder="Destino do cliente" value={destino}
        onChange={(e) => setDestino(e.target.value)}
        className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="cidade" className="text-slate-700">Cidade</Label>
      <Input id="cidade" placeholder="Cidade do cliente" value={cidade}
        onChange={(e) => setCidade(e.target.value)}
        className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="ano" className="text-slate-700">Ano</Label>
      <Input id="ano" placeholder="Ano especifico" value={ano}
        onChange={(e) => setAno(e.target.value)}
        className="bg-white/50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all duration-200"
      />
    </div>
  </>
);

export default ClienteFields;
