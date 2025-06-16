
interface AtendimentoData {
  id: string;
  nome: string;
  dataNascimento?: string;
  signo?: string;
  tipoServico: string;
  statusPagamento: 'pago' | 'pendente' | 'parcelado';
  dataAtendimento: string;
  valor: string;
  destino?: string;
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
}

export const useAtendimentoService = () => {
  const getAtendimentos = (): AtendimentoData[] => {
    try {
      const data = localStorage.getItem("atendimentos");
      const atendimentos = data ? JSON.parse(data) : [];
      console.log('getAtendimentos - Retornando:', atendimentos.length, 'atendimentos');
      return atendimentos;
    } catch (error) {
      console.error('getAtendimentos - Erro ao buscar atendimentos:', error);
      return [];
    }
  };

  const saveAtendimentos = (atendimentos: AtendimentoData[]) => {
    try {
      localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
      console.log('saveAtendimentos - Salvos:', atendimentos.length, 'atendimentos');
    } catch (error) {
      console.error('saveAtendimentos - Erro ao salvar atendimentos:', error);
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
