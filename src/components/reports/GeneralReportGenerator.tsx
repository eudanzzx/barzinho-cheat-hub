
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GeneralReportGeneratorProps {
  atendimentos: any[];
}

const GeneralReportGenerator: React.FC<GeneralReportGeneratorProps> = ({ atendimentos }) => {
  const downloadGeneralReport = () => {
    try {
      const doc = new jsPDF();
      
      // Header elegante
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text('Relatório Geral', 105, 25, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(120, 120, 120);
      doc.text('Resumo de Atendimentos', 105, 35, { align: 'center' });
      
      // Linha decorativa
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(30, 45, 180, 45);
      
      // Estatísticas em boxes
      const totalAtendimentos = atendimentos.length;
      const totalValue = atendimentos.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);
      const paidConsultations = atendimentos.filter(a => a.statusPagamento === 'pago').length;
      const pendingConsultations = atendimentos.filter(a => a.statusPagamento === 'pendente').length;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Box 1 - Total
      doc.rect(20, 55, 45, 25);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Total', 25, 63);
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text(totalAtendimentos.toString(), 42, 75, { align: 'center' });
      
      // Box 2 - Valor
      doc.rect(75, 55, 60, 25);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Receita Total', 80, 63);
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text(`R$ ${totalValue.toFixed(2)}`, 105, 75, { align: 'center' });
      
      // Box 3 - Status
      doc.rect(145, 55, 45, 25);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Pagos', 150, 63);
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94);
      doc.text(paidConsultations.toString(), 167, 75, { align: 'center' });
      
      // Função para formatar data de forma segura
      const formatarDataSegura = (data: string) => {
        if (!data || data.trim() === '') return 'N/A';
        try {
          const [ano, mes, dia] = data.split('-');
          if (ano && mes && dia) {
            return `${dia}/${mes}/${ano}`;
          }
          return 'N/A';
        } catch (error) {
          return 'N/A';
        }
      };

      // Tabela com serviços corrigidos
      const tableData = atendimentos.slice(0, 20).map(a => [
        a.nome || 'N/A',
        formatarDataSegura(a.dataAtendimento),
        a.tipoServico ? a.tipoServico.replace(/[-_]/g, ' ') : 'Consulta Geral',
        `R$ ${parseFloat(a.valor || "0").toFixed(2)}`
      ]);
      
      autoTable(doc, {
        head: [["Cliente", "Data", "Serviço", "Valor"]],
        body: tableData,
        startY: 95,
        theme: 'grid',
        styles: { 
          fontSize: 9, 
          cellPadding: 6,
          textColor: [60, 60, 60],
        },
        headStyles: { 
          fillColor: [37, 99, 235], 
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248],
        },
        margin: { left: 20, right: 20 },
      });
      
      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        // Formatar data atual de forma segura
        const hoje = new Date();
        const dataAtual = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
        
        doc.text(
          `Libertá - Relatório gerado em ${dataAtual} - Página ${i} de ${totalPages}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      // Formatar data atual de forma segura para nome do arquivo
      const hoje = new Date();
      const dataArquivo = `${hoje.getDate().toString().padStart(2, '0')}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-${hoje.getFullYear()}`;
      doc.save(`Relatorio_Geral_${dataArquivo}.pdf`);
      
      toast.success("Relatório geral gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  return (
    <Button
      onClick={downloadGeneralReport}
      className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white"
    >
      <FileText className="h-4 w-4 mr-2" />
      Relatório Geral
    </Button>
  );
};

export default GeneralReportGenerator;
