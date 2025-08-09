
interface AtendimentoData {
  id: string;
  nome: string;
  dataNascimento?: string;
  telefone?: string;
  signo?: string;
  tipoServico: string;
  statusPagamento: 'pago' | 'pendente' | 'parcelado';
  dataAtendimento: string;
  valor: string;
  destino?: string;
  cidade?: string;
  ano?: string;
  atencaoNota?: string;
  detalhes?: string;
  tratamento?: string;
  indicacao?: string;
  atencaoFlag?: boolean;
  data?: string;
  dataUltimaEdicao?: string;
  planoAtivo?: boolean;
  planoData?: {
    meses: string;
    valorMensal: string;
    diaVencimento?: string;
  } | null;
  semanalAtivo?: boolean;
  semanalData?: {
    semanas: string;
    valorSemanal: string;
    diaVencimento?: string;
  } | null;
  pacoteAtivo?: boolean;
  pacoteData?: {
    dias: string;
    pacoteDias: Array<{
      id: string;
      data: string;
      valor: string;
    }>;
  } | null;
}

export const useAtendimentoService = () => {
  const getAtendimentos = (): AtendimentoData[] => {
    try {
      const data = localStorage.getItem("atendimentos");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  };

  const saveAtendimentos = (atendimentos: AtendimentoData[]) => {
    try {
      localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
    } catch (error) {
      // Silent fail
    }
  };

  const getClientsWithConsultations = () => {
    const atendimentos = getAtendimentos();
    return atendimentos.map(a => ({
      id: a.id,
      nome: a.nome,
      consultations: [a]
    }));
  };

  return {
    getAtendimentos,
    saveAtendimentos,
    getClientsWithConsultations,
  };
};

export type { AtendimentoData };
