
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
      console.log('Último atendimento completo:', ultimoAtendimento);
      console.log('Todos os campos do último atendimento:', Object.keys(ultimoAtendimento));
      console.log('Tratamento encontrado:', ultimoAtendimento.tratamento);
      console.log('Indicacao encontrada:', ultimoAtendimento.indicacao);
      console.log('Detalhes encontrados:', ultimoAtendimento.detalhes);
      
      const doc = new jsPDF();
      
      // Configurações de cores
      const primaryColor = { r: 30, g: 64, b: 175 }; // #1E40AF
      const textColor = { r: 60, g: 60, b: 60 };
      const lightGray = { r: 120, g: 120, b: 120 };
      
      let yPosition = 30;
      const leftMargin = 25;
      const pageWidth = doc.internal.pageSize.width;
      
      // Header elegante
      doc.setFontSize(20);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.setFont('helvetica', 'bold');
      doc.text('Libertá Espaço Terapêutico', pageWidth / 2, yPosition, { align: 'center' });
      
      // Linha decorativa
      yPosition += 10;
      doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.setLineWidth(0.8);
      doc.line(leftMargin, yPosition, pageWidth - leftMargin, yPosition);
      
      yPosition += 25;
      
      // Função para adicionar campo no formato Pergunta: Resposta
      const addField = (label: string, value: string) => {
        if (yPosition > 250) return; // Evitar overflow da página
        
        doc.setFontSize(11);
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
        doc.setFont('helvetica', 'normal');
        
        const text = `${label}: ${value || 'Nao informado'}`;
        doc.text(text, leftMargin, yPosition);
        
        yPosition += 14;
      };
      
      // Função para adicionar campos de texto longo com verificação mais robusta
      const addLongTextField = (label: string, value: string) => {
        if (yPosition > 200) return; // Evitar overflow da página
        
        doc.setFontSize(12);
        doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, leftMargin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
        doc.setFont('helvetica', 'normal');
        
        // Verificação mais robusta do valor
        const textContent = value && typeof value === 'string' && value.trim() !== '' ? value.trim() : 'Nao informado';
        
        console.log(`Processando campo ${label}:`, textContent);
        
        const textLines = doc.splitTextToSize(textContent, pageWidth - leftMargin * 2);
        doc.text(textLines, leftMargin, yPosition);
        yPosition += Math.max(textLines.length * 5, 10) + 10;
      };
      
      // Informações do Cliente
      addField('Nome do Cliente', cliente.nome);
      
      // Formatar data de nascimento
      let dataNascimento = 'Nao informada';
      if (ultimoAtendimento.dataNascimento) {
        try {
          const date = new Date(ultimoAtendimento.dataNascimento);
          if (!isNaN(date.getTime())) {
            dataNascimento = date.toLocaleDateString('pt-BR');
          }
        } catch (error) {
          console.error('Erro ao formatar data de nascimento:', error);
        }
      }
      addField('Data de Nascimento', dataNascimento);
      addField('Signo', ultimoAtendimento.signo);
      
      yPosition += 5;
      
      // Informações do Atendimento
      addField('Tipo de Servico', ultimoAtendimento.tipoServico);
      
      // Formatar data do atendimento
      let dataAtendimento = 'Nao informada';
      if (ultimoAtendimento.dataAtendimento) {
        try {
          const date = new Date(ultimoAtendimento.dataAtendimento);
          if (!isNaN(date.getTime())) {
            dataAtendimento = date.toLocaleDateString('pt-BR');
          }
        } catch (error) {
          console.error('Erro ao formatar data do atendimento:', error);
        }
      }
      addField('Data do Atendimento', dataAtendimento);
      
      const valorFormatado = ultimoAtendimento.valor ? `R$ ${parseFloat(ultimoAtendimento.valor).toFixed(2)}` : 'Nao informado';
      addField('Valor Cobrado', valorFormatado);
      addField('Status de Pagamento', ultimoAtendimento.statusPagamento);
      addField('Destino', ultimoAtendimento.destino);
      addField('Ano', ultimoAtendimento.ano);
      
      yPosition += 5;
      
      // Plano Mensal - verificação corrigida
      let planoMensalTexto = 'Nao contratado';
      
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
      let planoSemanalTexto = 'Nao contratado';
      
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
      
      yPosition += 10;
      
      // Detalhes da Sessão - campo de texto maior
      addLongTextField('Detalhes da Sessao', ultimoAtendimento.detalhes);
      
      // Tratamento - campo de texto maior
      addLongTextField('Tratamento', ultimoAtendimento.tratamento);
      
      // Indicação - campo de texto maior
      addLongTextField('Indicacao', ultimoAtendimento.indicacao);
      
      // Footer
      yPosition = doc.internal.pageSize.height - 20;
      doc.setFontSize(8);
      doc.setTextColor(lightGray.r, lightGray.g, lightGray.b);
      doc.text(
        `Liberta Espaco Terapeutico - Formulario gerado em ${new Date().toLocaleDateString('pt-BR')}`,
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
