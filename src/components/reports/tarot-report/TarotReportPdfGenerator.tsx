import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ClientData {
  nome: string;
  analises: any[];
}

export class TarotReportPdfGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private margin: number = 20;
  private yPos: number = 30;

  // Cores elegantes
  private readonly colors = {
    primary: { r: 103, g: 49, b: 147 }, // #673193
    text: { r: 45, g: 45, b: 45 },
    section: { r: 79, g: 70, b: 229 }
  };

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
  }

  private formatarDataSegura = (data: string) => {
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

  private addField = (label: string, value: string) => {
    if (this.yPos > 260) return;
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.colors.text.r, this.colors.text.g, this.colors.text.b);
    this.doc.setFont('helvetica', 'normal');
    
    const fieldText = `${label}: ${value || 'N/A'}`;
    this.doc.text(fieldText, this.margin, this.yPos);
    
    this.yPos += 8;
  };

  private addSection = (title: string) => {
    if (this.yPos > 260) return;
    
    this.yPos += 8;
    this.doc.setFontSize(12);
    this.doc.setTextColor(this.colors.section.r, this.colors.section.g, this.colors.section.b);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.yPos);
    this.yPos += 12;
  };

  private addHeader(cliente: ClientData) {
    this.doc.setFontSize(16);
    this.doc.setTextColor(this.colors.primary.r, this.colors.primary.g, this.colors.primary.b);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RELATÓRIO INDIVIDUAL - TAROT', this.pageWidth / 2, this.yPos, { align: 'center' });
    this.yPos += 20;
  }

  private addClientInfo(ultimaAnalise: any) {
    this.addSection('INFORMAÇÕES DO CLIENTE');

    this.addField('Nome do Cliente', ultimaAnalise.nomeCliente);
    this.addField('Data de Nascimento', this.formatarDataSegura(ultimaAnalise?.dataNascimento || ultimaAnalise?.nascimento));
    this.addField('Signo', ultimaAnalise?.signo);
    this.addField('Data da Análise', this.formatarDataSegura(ultimaAnalise?.dataInicio || ultimaAnalise?.createdAt));
    
    const preco = parseFloat(ultimaAnalise?.preco || "150").toFixed(2);
    this.addField('Valor', `R$ ${preco}`);
    this.addField('Status', ultimaAnalise?.finalizado ? 'Finalizada' : 'Em andamento');
  }

  private addPlanInfo(ultimaAnalise: any) {
    if (ultimaAnalise?.planoAtivo && ultimaAnalise?.planoData) {
      // Plano Mensal
      const meses = ultimaAnalise.planoData.meses || 'N/A';
      const valorMensal = ultimaAnalise.planoData.valorMensal || 'N/A';
      
      this.addField('Tipo de Plano', 'PLANO MENSAL');
      this.addField('Duração', meses !== 'N/A' ? `${meses} meses` : 'N/A');
      
      if (valorMensal !== 'N/A' && meses !== 'N/A') {
        const valorTotal = parseFloat(valorMensal) * parseInt(meses);
        this.addField('Valor Total', `R$ ${valorTotal.toFixed(2)}`);
      } else {
        this.addField('Valor Total', 'N/A');
      }
      
      this.addField('Valor por Mês', valorMensal !== 'N/A' ? `R$ ${parseFloat(valorMensal).toFixed(2)}` : 'N/A');
    } else if (ultimaAnalise?.semanalAtivo && ultimaAnalise?.semanalData) {
      // Plano Semanal
      const semanas = ultimaAnalise.semanalData.semanas || 'N/A';
      const valorSemanal = ultimaAnalise.semanalData.valorSemanal || 'N/A';
      
      this.addField('Tipo de Plano', 'PLANO SEMANAL');
      this.addField('Duração', semanas !== 'N/A' ? `${semanas} semanas` : 'N/A');
      
      if (valorSemanal !== 'N/A' && semanas !== 'N/A') {
        const valorTotal = parseFloat(valorSemanal) * parseInt(semanas);
        this.addField('Valor Total', `R$ ${valorTotal.toFixed(2)}`);
      } else {
        this.addField('Valor Total', 'N/A');
      }
      
      this.addField('Valor por Semana', valorSemanal !== 'N/A' ? `R$ ${parseFloat(valorSemanal).toFixed(2)}` : 'N/A');
    } else {
      // Caso não tenha plano ativo, mostrar valores padrão/legados
      const semanas = ultimaAnalise?.semanas || 'N/A';
      const valorSemanal = ultimaAnalise?.valorSemanal || 'N/A';
      
      this.addField('Tipo de Plano', 'PLANO SEMANAL');
      this.addField('Duração', semanas !== 'N/A' ? `${semanas} semanas` : 'N/A');
      
      if (valorSemanal !== 'N/A' && semanas !== 'N/A') {
        const valorTotal = parseFloat(valorSemanal) * parseInt(semanas);
        this.addField('Valor Total', `R$ ${valorTotal.toFixed(2)}`);
      } else {
        this.addField('Valor Total', 'N/A');
      }
      
      this.addField('Valor por Semana', valorSemanal !== 'N/A' ? `R$ ${parseFloat(valorSemanal).toFixed(2)}` : 'N/A');
    }
  }

  private addAnalysisContent(ultimaAnalise: any) {
    // ANÁLISE – ANTES
    this.addSection('ANÁLISE – ANTES');

    const analiseAntes = ultimaAnalise?.analiseAntes || ultimaAnalise?.pergunta || '';
    if (analiseAntes && analiseAntes.trim() !== '') {
      this.doc.setFontSize(10);
      this.doc.setTextColor(this.colors.text.r, this.colors.text.g, this.colors.text.b);
      this.doc.setFont('helvetica', 'normal');
      const analiseAntesLines = this.doc.splitTextToSize(analiseAntes.trim(), this.pageWidth - 2 * this.margin);
      this.doc.text(analiseAntesLines, this.margin, this.yPos);
      this.yPos += analiseAntesLines.length * 5 + 12;
    } else {
      this.yPos += 12;
    }

    // ANÁLISE – DEPOIS
    this.addSection('ANÁLISE – DEPOIS');

    const analiseDepois = ultimaAnalise?.analiseDepois || ultimaAnalise?.resposta || ultimaAnalise?.leitura || ultimaAnalise?.orientacao || '';
    if (analiseDepois && analiseDepois.trim() !== '') {
      this.doc.setFontSize(10);
      this.doc.setTextColor(this.colors.text.r, this.colors.text.g, this.colors.text.b);
      this.doc.setFont('helvetica', 'normal');
      const analiseDepoisLines = this.doc.splitTextToSize(analiseDepois.trim(), this.pageWidth - 2 * this.margin);
      this.doc.text(analiseDepoisLines, this.margin, this.yPos);
      this.yPos += analiseDepoisLines.length * 5 + 12;
    } else {
      this.yPos += 12;
    }
  }

  private addCounters(ultimaAnalise: any) {
    if (ultimaAnalise?.lembretes && ultimaAnalise.lembretes.length > 0) {
      ultimaAnalise.lembretes.forEach((lembrete: any, index: number) => {
        if (this.yPos > 250) return;
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(this.colors.text.r, this.colors.text.g, this.colors.text.b);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Contador ${index + 1}`, this.margin, this.yPos);
        this.yPos += 6;
        
        this.doc.setFont('helvetica', 'normal');
        const tratamentoText = `(${lembrete.texto || 'Descrição do tratamento'}) (${lembrete.dias || 'N/A'} dias)`;
        const tratamentoLines = this.doc.splitTextToSize(tratamentoText, this.pageWidth - 2 * this.margin);
        this.doc.text(tratamentoLines, this.margin, this.yPos);
        this.yPos += tratamentoLines.length * 5 + 8;
      });
    } else {
      this.doc.setFontSize(10);
      this.doc.setTextColor(this.colors.text.r, this.colors.text.g, this.colors.text.b);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Contador 1', this.margin, this.yPos);
      this.yPos += 6;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('(Descrição do tratamento) (dias)', this.margin, this.yPos);
    }
  }

  private addFooter() {
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(
      `Relatório gerado em ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
      this.pageWidth / 2,
      this.doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  generateReport(cliente: ClientData): jsPDF {
    const ultimaAnalise = cliente.analises[cliente.analises.length - 1];

    this.addHeader(cliente);
    this.addClientInfo(ultimaAnalise);
    this.addPlanInfo(ultimaAnalise);
    this.addAnalysisContent(ultimaAnalise);
    this.addCounters(ultimaAnalise);
    this.addFooter();

    return this.doc;
  }

  saveReport(cliente: ClientData, fileName?: string) {
    this.generateReport(cliente);
    const finalFileName = fileName || `relatorio-tarot-${cliente.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    this.doc.save(finalFileName);
  }
}