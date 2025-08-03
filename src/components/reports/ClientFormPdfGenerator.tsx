
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface ClientFormPdfGeneratorProps {
  cliente: {
    nome: string;
    atendimentos: any[];
  };
}

const ClientFormPdfGenerator: React.FC<ClientFormPdfGeneratorProps> = ({ cliente }) => {
  const generateClientFormPdf = () => {
    try {
      if (!cliente.atendimentos || cliente.atendimentos.length === 0) {
        toast.error("Nenhum atendimento encontrado para este cliente");
        return;
      }

      // Usar o último atendimento como base
      const ultimoAtendimento = cliente.atendimentos[cliente.atendimentos.length - 1];
      
      // Debug logs mais detalhados para verificar a estrutura dos dados
      console.log('=== DEBUG PDF GENERATOR ===');
      console.log('Cliente:', cliente.nome);
      console.log('Total de atendimentos:', cliente.atendimentos.length);
      console.log('Último atendimento completo:', JSON.stringify(ultimoAtendimento, null, 2));
      console.log('Todos os campos do último atendimento:', Object.keys(ultimoAtendimento));
      
      // Verificar diretamente os campos tratamento e indicacao
      console.log('TRATAMENTO direto:', ultimoAtendimento.tratamento);
      console.log('INDICACAO direta:', ultimoAtendimento.indicacao);
      
      // Verificação específica dos campos problemáticos
      console.log('=== CAMPOS ESPECÍFICOS ===');
      console.log('Tratamento direto:', ultimoAtendimento.tratamento);
      console.log('Indicacao direta:', ultimoAtendimento.indicacao);
      console.log('Detalhes diretos:', ultimoAtendimento.detalhes);
      
      // Verificar todos os campos que contêm "trat" ou "indic"
      Object.keys(ultimoAtendimento).forEach(key => {
        if (key.toLowerCase().includes('trat') || key.toLowerCase().includes('indic')) {
          console.log(`Campo encontrado - ${key}:`, ultimoAtendimento[key]);
        }
      });
      
      const doc = new jsPDF();
      
      // Configurações de cores mais elegantes
      const primaryColor = { r: 30, g: 64, b: 175 }; // #1E40AF
      const textColor = { r: 45, g: 45, b: 45 };
      const lightGray = { r: 120, g: 120, b: 120 };
      const accentColor = { r: 79, g: 70, b: 229 }; // #4F46E5
      
      let yPosition = 25;
      const leftMargin = 20;
      const pageWidth = doc.internal.pageSize.width;
      
      // Header mais elegante
      doc.setFontSize(18);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.setFont('helvetica', 'bold');
      doc.text('Libertá Espaço Terapêutico', pageWidth / 2, yPosition, { align: 'center' });
      
      // Linha decorativa com gradiente visual
      yPosition += 8;
      doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.setLineWidth(1);
      doc.line(leftMargin, yPosition, pageWidth - leftMargin, yPosition);
      
      yPosition += 15;
      
      // Função para adicionar campo com estilo elegante e espaçamento correto
      const addField = (label: string, value: string) => {
        if (yPosition > 260) return; // Garantir que caiba em uma página
        
        doc.setFontSize(10);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setFont('helvetica', 'bold');
        
        // Medir a largura do label para posicionar o valor corretamente
        const labelText = `${label}:`;
        const labelWidth = doc.getTextWidth(labelText);
        
        doc.text(labelText, leftMargin, yPosition);
        
        doc.setFontSize(10);
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
        doc.setFont('helvetica', 'normal');
        
        // Posicionar o valor com apenas um espaço após o ":"
        const spaceWidth = doc.getTextWidth(' ');
        doc.text(value || 'Não informado', leftMargin + labelWidth + spaceWidth, yPosition);
        
        yPosition += 12;
      };
      
      
      // Informações do Cliente
      addField('Nome do Cliente', cliente.nome);
      
      // Formatar data de nascimento
      let dataNascimento = 'Não informada';
      if (ultimoAtendimento.dataNascimento) {
        try {
          // Usar diretamente a data sem construtor Date para evitar timezone
          const [ano, mes, dia] = ultimoAtendimento.dataNascimento.split('-');
          if (ano && mes && dia) {
            dataNascimento = `${dia}/${mes}/${ano}`;
          }
        } catch (error) {
          console.error('Erro ao formatar data de nascimento:', error);
        }
      }
      addField('Data de Nascimento', dataNascimento);
      addField('Signo', ultimoAtendimento.signo);
      
      // Informações do Atendimento
      addField('Tipo de Servico', ultimoAtendimento.tipoServico);
      
      // Formatar data do atendimento
      let dataAtendimento = 'Não informada';
      if (ultimoAtendimento.dataAtendimento) {
        try {
          // Usar diretamente a data sem construtor Date para evitar timezone
          const [ano, mes, dia] = ultimoAtendimento.dataAtendimento.split('-');
          if (ano && mes && dia) {
            dataAtendimento = `${dia}/${mes}/${ano}`;
          }
        } catch (error) {
          console.error('Erro ao formatar data do atendimento:', error);
        }
      }
      addField('Data do Atendimento', dataAtendimento);
      
      const valorFormatado = ultimoAtendimento.valor ? `R$ ${parseFloat(ultimoAtendimento.valor).toFixed(2)}` : 'Não informado';
      addField('Valor Cobrado', valorFormatado);
      addField('Status de Pagamento', ultimoAtendimento.statusPagamento);
      addField('Destino', ultimoAtendimento.destino);
      addField('Cidade', ultimoAtendimento.cidade);
      addField('Ano', ultimoAtendimento.ano);
      
      // Plano Mensal - verificação corrigida
      let planoMensalTexto = 'Não contratado';
      
      console.log('Verificando plano mensal - planoAtivo:', ultimoAtendimento.planoAtivo);
      console.log('Verificando plano mensal - planoData:', ultimoAtendimento.planoData);
      
      if (ultimoAtendimento.planoAtivo === true && ultimoAtendimento.planoData) {
        const planoData = ultimoAtendimento.planoData;
        console.log('Dados do plano mensal:', planoData);
        
        if (planoData.meses && planoData.valorMensal && planoData.diaVencimento) {
          planoMensalTexto = `${planoData.meses} meses - R$ ${parseFloat(planoData.valorMensal).toFixed(2)} - Vencimento: dia ${planoData.diaVencimento}`;
          console.log('Plano mensal formatado:', planoMensalTexto);
        }
      }
      
      addField('PLANO MENSAL', planoMensalTexto);
      
      // Plano Semanal - verificação corrigida
      let planoSemanalTexto = 'Não contratado';
      
      console.log('Verificando plano semanal - semanalAtivo:', ultimoAtendimento.semanalAtivo);
      console.log('Verificando plano semanal - semanalData:', ultimoAtendimento.semanalData);
      
      if (ultimoAtendimento.semanalAtivo === true && ultimoAtendimento.semanalData) {
        const semanalData = ultimoAtendimento.semanalData;
        console.log('Dados do plano semanal:', semanalData);
        
        if (semanalData.semanas && semanalData.valorSemanal && semanalData.diaVencimento) {
          // Converter o dia da semana para texto
          const diasSemana: { [key: string]: string } = {
            'segunda': 'segunda-feira',
            'terca': 'terca-feira',
            'quarta': 'quarta-feira',
            'quinta': 'quinta-feira',
            'sexta': 'sexta-feira',
            'sabado': 'sabado',
            'domingo': 'domingo'
          };
          
          const diaVencimentoTexto = diasSemana[semanalData.diaVencimento] || semanalData.diaVencimento;
          planoSemanalTexto = `${semanalData.semanas} semanas - R$ ${parseFloat(semanalData.valorSemanal).toFixed(2)} - Vencimento: ${diaVencimentoTexto}`;
          console.log('Plano semanal formatado:', planoSemanalTexto);
        }
      }
      
      addField('PLANO SEMANAL', planoSemanalTexto);
      
      // Tratamento - buscar em todos os campos possíveis
      let tratamentoValue = '';
      
      // Lista de possíveis campos onde o tratamento pode estar
      const tratamentoCandidates = [
        'tratamento', 'Tratamento', 'TRATAMENTO', 
        'analysis_treatment', 'treatment', 'terapia',
        'recomendacao', 'recomendação', 'prescricao', 'prescrição'
      ];
      
      for (const field of tratamentoCandidates) {
        if (ultimoAtendimento[field] && typeof ultimoAtendimento[field] === 'string' && ultimoAtendimento[field].trim() !== '') {
          tratamentoValue = ultimoAtendimento[field].trim();
          console.log(`Tratamento encontrado no campo '${field}':`, tratamentoValue);
          break;
        }
      }
      
      // Se não encontrou, mostrar debug completo
      if (!tratamentoValue) {
        console.log('=== CAMPOS DE TRATAMENTO NÃO ENCONTRADOS ===');
        console.log('Campos disponíveis:', Object.keys(ultimoAtendimento));
        console.log('Valores dos campos que contêm "trat":', 
          Object.entries(ultimoAtendimento).filter(([key]) => key.toLowerCase().includes('trat'))
        );
      }
      
      addField('Tratamento', tratamentoValue || 'N/A');
      
      // Indicação - buscar em todos os campos possíveis
      let indicacaoValue = '';
      
      // Lista de possíveis campos onde a indicação pode estar
      const indicacaoCandidates = [
        'indicacao', 'indicação', 'Indicacao', 'Indicação', 
        'INDICACAO', 'INDICAÇÃO', 'analysis_indication', 
        'indication', 'orientacao', 'orientação', 'conselho'
      ];
      
      for (const field of indicacaoCandidates) {
        if (ultimoAtendimento[field] && typeof ultimoAtendimento[field] === 'string' && ultimoAtendimento[field].trim() !== '') {
          indicacaoValue = ultimoAtendimento[field].trim();
          console.log(`Indicação encontrada no campo '${field}':`, indicacaoValue); 
          break;
        }
      }
      
      // Se não encontrou, mostrar debug completo
      if (!indicacaoValue) {
        console.log('=== CAMPOS DE INDICAÇÃO NÃO ENCONTRADOS ===');
        console.log('Campos disponíveis:', Object.keys(ultimoAtendimento));
        console.log('Valores dos campos que contêm "indic":', 
          Object.entries(ultimoAtendimento).filter(([key]) => key.toLowerCase().includes('indic'))
        );
      }
      
      addField('Indicacao', indicacaoValue || 'N/A');
      
      // Footer
      yPosition = doc.internal.pageSize.height - 20;
      doc.setFontSize(8);
      doc.setTextColor(lightGray.r, lightGray.g, lightGray.b);
      // Formatar data atual de forma segura
      const hoje = new Date();
      const dataAtual = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
      
      doc.text(
        `Liberta Espaco Terapeutico - Formulario gerado em ${dataAtual}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
      );
      
      // Salvar o PDF
      const fileName = `Formulario_Atendimento_${cliente.nome.replace(/ /g, '_')}.pdf`;
      doc.save(fileName);
      
      toast.success(`Formulario de ${cliente.nome} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar formulario");
    }
  };

  return (
    <Button
      onClick={generateClientFormPdf}
      className="bg-main-primary hover:bg-main-primary/90 text-white"
      size="sm"
    >
      <FileText className="h-4 w-4 mr-2" />
      Gerar Formulario
    </Button>
  );
};

export default ClientFormPdfGenerator;
