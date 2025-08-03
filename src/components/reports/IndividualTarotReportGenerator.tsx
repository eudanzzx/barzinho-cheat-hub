
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
      return 'N/A';
    }
    
    try {
      // Usar diretamente a data sem construtor Date para evitar timezone
      const [ano, mes, dia] = data.split('-');
      if (ano && mes && dia) {
        return `${dia}/${mes}/${ano}`;
      }
      return 'N/A';
    } catch (error) {
      return 'N/A';
    }
  };

  const gerarRelatorioIndividual = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPos = 30;

      const ultimaAnalise = cliente.analises[cliente.analises.length - 1];

      // Cores elegantes
      const primaryColor = { r: 103, g: 49, b: 147 }; // #673193
      const textColor = { r: 45, g: 45, b: 45 };
      const sectionColor = { r: 79, g: 70, b: 229 };

      // Função para adicionar campo com espaçamento correto (apenas um espaço após o :)
      const addField = (label: string, value: string) => {
        if (yPos > 260) return;
        
        doc.setFontSize(10);
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
        doc.setFont('helvetica', 'normal');
        
        const fieldText = `${label}: ${value || 'N/A'}`;
        doc.text(fieldText, margin, yPos);
        
        yPos += 8;
      };

      // Função para adicionar seção
      const addSection = (title: string) => {
        if (yPos > 260) return;
        
        yPos += 8;
        doc.setFontSize(12);
        doc.setTextColor(sectionColor.r, sectionColor.g, sectionColor.b);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPos);
        yPos += 12;
      };

      // Header
      doc.setFontSize(16);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO INDIVIDUAL - TAROT', pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;

      // INFORMAÇÕES DO CLIENTE
      addSection('INFORMAÇÕES DO CLIENTE');

      addField('Nome do Cliente', cliente.nome);
      addField('Data de Nascimento', formatarDataSegura(ultimaAnalise?.dataNascimento || ultimaAnalise?.nascimento));
      addField('Signo', ultimaAnalise?.signo);
      addField('Data da Análise', formatarDataSegura(ultimaAnalise?.dataInicio || ultimaAnalise?.createdAt));
      
      const preco = parseFloat(ultimaAnalise?.preco || "150").toFixed(2);
      addField('Valor', `R$ ${preco}`);
      addField('Status', ultimaAnalise?.finalizado ? 'Finalizada' : 'Em andamento');

      // PLANO - Verificar qual tipo de plano está ativo
      if (ultimaAnalise?.planoAtivo && ultimaAnalise?.planoData) {
        // Plano Mensal
        const meses = ultimaAnalise.planoData.meses || 'N/A';
        const valorMensal = ultimaAnalise.planoData.valorMensal || 'N/A';
        
        addField('Tipo de Plano', 'PLANO MENSAL');
        addField('Duração', meses !== 'N/A' ? `${meses} meses` : 'N/A');
        
        if (valorMensal !== 'N/A' && meses !== 'N/A') {
          const valorTotal = parseFloat(valorMensal) * parseInt(meses);
          addField('Valor Total', `R$ ${valorTotal.toFixed(2)}`);
        } else {
          addField('Valor Total', 'N/A');
        }
        
        addField('Valor por Mês', valorMensal !== 'N/A' ? `R$ ${parseFloat(valorMensal).toFixed(2)}` : 'N/A');
      } else if (ultimaAnalise?.semanalAtivo && ultimaAnalise?.semanalData) {
        // Plano Semanal
        const semanas = ultimaAnalise.semanalData.semanas || 'N/A';
        const valorSemanal = ultimaAnalise.semanalData.valorSemanal || 'N/A';
        
        addField('Tipo de Plano', 'PLANO SEMANAL');
        addField('Duração', semanas !== 'N/A' ? `${semanas} semanas` : 'N/A');
        
        if (valorSemanal !== 'N/A' && semanas !== 'N/A') {
          const valorTotal = parseFloat(valorSemanal) * parseInt(semanas);
          addField('Valor Total', `R$ ${valorTotal.toFixed(2)}`);
        } else {
          addField('Valor Total', 'N/A');
        }
        
        addField('Valor por Semana', valorSemanal !== 'N/A' ? `R$ ${parseFloat(valorSemanal).toFixed(2)}` : 'N/A');
      } else {
        // Caso não tenha plano ativo, mostrar valores padrão/legados
        const semanas = ultimaAnalise?.semanas || 'N/A';
        const valorSemanal = ultimaAnalise?.valorSemanal || 'N/A';
        
        addField('Tipo de Plano', 'PLANO SEMANAL');
        addField('Duração', semanas !== 'N/A' ? `${semanas} semanas` : 'N/A');
        
        if (valorSemanal !== 'N/A' && semanas !== 'N/A') {
          const valorTotal = parseFloat(valorSemanal) * parseInt(semanas);
          addField('Valor Total', `R$ ${valorTotal.toFixed(2)}`);
        } else {
          addField('Valor Total', 'N/A');
        }
        
        addField('Valor por Semana', valorSemanal !== 'N/A' ? `R$ ${parseFloat(valorSemanal).toFixed(2)}` : 'N/A');
      }

      // ANÁLISE – ANTES
      addSection('ANÁLISE – ANTES');

      const analiseAntes = ultimaAnalise?.analiseAntes || ultimaAnalise?.pergunta || '';
      if (analiseAntes && analiseAntes.trim() !== '') {
        doc.setFontSize(10);
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
        doc.setFont('helvetica', 'normal');
        const analiseAntesLines = doc.splitTextToSize(analiseAntes.trim(), pageWidth - 2 * margin);
        doc.text(analiseAntesLines, margin, yPos);
        yPos += analiseAntesLines.length * 5 + 12;
      } else {
        yPos += 12;
      }

      // ANÁLISE – DEPOIS
      addSection('ANÁLISE – DEPOIS');

      const analiseDepois = ultimaAnalise?.analiseDepois || ultimaAnalise?.resposta || ultimaAnalise?.leitura || ultimaAnalise?.orientacao || '';
      if (analiseDepois && analiseDepois.trim() !== '') {
        doc.setFontSize(10);
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
        doc.setFont('helvetica', 'normal');
        const analiseDepoisLines = doc.splitTextToSize(analiseDepois.trim(), pageWidth - 2 * margin);
        doc.text(analiseDepoisLines, margin, yPos);
        yPos += analiseDepoisLines.length * 5 + 12;
      } else {
        yPos += 12;
      }

      // Contadores (sem título "TRATAMENTO")
      if (ultimaAnalise?.lembretes && ultimaAnalise.lembretes.length > 0) {
        ultimaAnalise.lembretes.forEach((lembrete: any, index: number) => {
          if (yPos > 250) return;
          
          doc.setFontSize(10);
          doc.setTextColor(textColor.r, textColor.g, textColor.b);
          doc.setFont('helvetica', 'bold');
          doc.text(`Contador ${index + 1}`, margin, yPos);
          yPos += 6;
          
          doc.setFont('helvetica', 'normal');
          const tratamentoText = `(${lembrete.texto || 'Descrição do tratamento'}) (${lembrete.dias || 'N/A'} dias)`;
          const tratamentoLines = doc.splitTextToSize(tratamentoText, pageWidth - 2 * margin);
          doc.text(tratamentoLines, margin, yPos);
          yPos += tratamentoLines.length * 5 + 8;
        });
      } else {
        doc.setFontSize(10);
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
        doc.setFont('helvetica', 'bold');
        doc.text('Contador 1', margin, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.text('(Descrição do tratamento) (dias)', margin, yPos);
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
