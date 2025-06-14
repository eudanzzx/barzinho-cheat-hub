import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IndividualTarotReportGeneratorProps {
  cliente: {
    nome: string;
    analises: any[];
  };
  className?: string;
}

const IndividualTarotReportGenerator: React.FC<IndividualTarotReportGeneratorProps> = ({ cliente, className }) => {
  const formatarDataSegura = (data: string) => {
    if (!data || data.trim() === '') {
      return '';
    }
    
    try {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) {
        return '';
      }
      return format(dataObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return '';
    }
  };

  const gerarRelatorioIndividual = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPos = 25;

      // Header
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text('RELATÓRIO INDIVIDUAL - TAROT', pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;

      const ultimaAnalise = cliente.analises[cliente.analises.length - 1];

      // Debug: Log dos dados para verificar o que está disponível
      console.log('Dados da análise para PDF:', ultimaAnalise);
      console.log('Campo analiseAntes:', ultimaAnalise?.analiseAntes);
      console.log('Campo analiseDepois:', ultimaAnalise?.analiseDepois);
      console.log('Campo lembretes:', ultimaAnalise?.lembretes);

      // Informações básicas do cliente
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');

      // Nome do Cliente
      doc.text(`Nome do Cliente: ${cliente.nome}`, margin, yPos);
      yPos += 8;

      // Data de Nascimento
      const dataNasc = ultimaAnalise?.dataNascimento ? formatarDataSegura(ultimaAnalise.dataNascimento) : '';
      doc.text(`Data de Nascimento: ${dataNasc}`, margin, yPos);
      yPos += 8;

      // Signo
      doc.text(`Signo: ${ultimaAnalise?.signo || ''}`, margin, yPos);
      yPos += 8;

      // Data de Início
      const dataInicio = ultimaAnalise?.dataInicio ? formatarDataSegura(ultimaAnalise.dataInicio) : '';
      doc.text(`Data de Início: ${dataInicio}`, margin, yPos);
      yPos += 8;

      // Preço
      const preco = parseFloat(ultimaAnalise?.preco || "150").toFixed(2);
      doc.text(`Preço (R$): ${preco}`, margin, yPos);
      yPos += 15;

      // ANÁLISE - ANTES
      doc.setFont(undefined, 'bold');
      doc.text('ANÁLISE - ANTES', margin, yPos);
      yPos += 10;

      doc.setFont(undefined, 'normal');
      // Usar o campo analiseAntes que contém o texto real
      const analiseAntes = ultimaAnalise?.analiseAntes || '';
      if (analiseAntes && analiseAntes.trim() !== '') {
        const analiseAntesLines = doc.splitTextToSize(analiseAntes.trim(), pageWidth - 2 * margin);
        doc.text(analiseAntesLines, margin, yPos);
        yPos += analiseAntesLines.length * 6 + 10;
      } else {
        yPos += 10;
      }

      // ANÁLISE - DEPOIS
      doc.setFont(undefined, 'bold');
      doc.text('ANÁLISE - DEPOIS', margin, yPos);
      yPos += 10;

      doc.setFont(undefined, 'normal');
      // Usar o campo analiseDepois que contém o texto real
      const analiseDepois = ultimaAnalise?.analiseDepois || '';
      if (analiseDepois && analiseDepois.trim() !== '') {
        const analiseDepoisLines = doc.splitTextToSize(analiseDepois.trim(), pageWidth - 2 * margin);
        doc.text(analiseDepoisLines, margin, yPos);
        yPos += analiseDepoisLines.length * 6 + 10;
      } else {
        yPos += 10;
      }

      // PLANO
      doc.setFont(undefined, 'bold');
      doc.text('PLANO', margin, yPos);
      yPos += 10;

      doc.setFont(undefined, 'normal');
      
      // Meses
      const meses = ultimaAnalise?.planoData?.meses || '';
      doc.text(`Meses: ${meses}`, margin, yPos);
      yPos += 8;

      // Valor Mensal
      const valorMensal = ultimaAnalise?.planoData?.valorMensal || '';
      doc.text(`Valor Mensal (R$): ${valorMensal}`, margin, yPos);
      yPos += 8;

      // Dia de Vencimento (Plano)
      const diaVencimentoPlano = ultimaAnalise?.planoData?.diaVencimento || '';
      doc.text(`Dia de Vencimento: ${diaVencimentoPlano}`, margin, yPos);
      yPos += 15;

      // SEMANAL
      doc.setFont(undefined, 'bold');
      doc.text('SEMANAL', margin, yPos);
      yPos += 10;

      doc.setFont(undefined, 'normal');
      
      // Semanas
      const semanas = ultimaAnalise?.semanalData?.semanas || '';
      doc.text(`Semanas: ${semanas}`, margin, yPos);
      yPos += 8;

      // Valor Semanal
      const valorSemanal = ultimaAnalise?.semanalData?.valorSemanal || '';
      doc.text(`Valor Semanal (R$): ${valorSemanal}`, margin, yPos);
      yPos += 8;

      // Dia de Vencimento (Semanal)
      const diaVencimentoSemanal = ultimaAnalise?.semanalData?.diaVencimento || '';
      doc.text(`Dia de Vencimento: ${diaVencimentoSemanal}`, margin, yPos);
      yPos += 15;

      // Tratamento
      doc.setFont(undefined, 'bold');
      doc.text('Tratamento:', margin, yPos);
      yPos += 10;

      doc.setFont(undefined, 'normal');
      
      // Contador (extrair dos lembretes)
      if (ultimaAnalise?.lembretes && ultimaAnalise.lembretes.length > 0) {
        const contadores = ultimaAnalise.lembretes.map((lembrete: any, index: number) => 
          `${index + 1}. ${lembrete.texto} (${lembrete.dias} dias)`
        ).join('\n');
        doc.text('Contador:', margin, yPos);
        yPos += 8;
        const contadorLines = doc.splitTextToSize(contadores, pageWidth - 2 * margin);
        doc.text(contadorLines, margin, yPos);
        yPos += contadorLines.length * 6 + 8;
      } else {
        doc.text('Contador:', margin, yPos);
        yPos += 8;
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Relatório gerado em ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );

      doc.save(`relatorio-tarot-${cliente.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      toast.success(`Relatório individual para ${cliente.nome} gerado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao gerar relatório individual:', error);
      toast.error('Erro ao gerar relatório. Verifique os dados do cliente.');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`border-[#673193]/30 text-[#673193] hover:bg-[#673193]/10 ${className}`}
      onClick={gerarRelatorioIndividual}
    >
      <FileText className="h-4 w-4 mr-2" />
      Baixar Relatório
    </Button>
  );
};

export default IndividualTarotReportGenerator;
