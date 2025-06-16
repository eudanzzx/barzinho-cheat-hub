
import React from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const generateTreatmentContent = (doc: jsPDF, analise: any, yPos: number) => {
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;

  // TRATAMENTO
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.text('TRATAMENTO', margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.text('Contador 1:', margin, yPos);
  yPos += 8;

  doc.text('Descrição do tratamento:', margin, yPos);
  yPos += 6;

  if (analise?.orientacao) {
    const orientacaoLines = doc.splitTextToSize(analise.orientacao, pageWidth - 2 * margin);
    doc.text(orientacaoLines, margin, yPos);
    yPos += orientacaoLines.length * 5 + 10;
  } else {
    yPos += 15;
  }

  doc.text('Avisar daqui a: [7 dias / próxima sessão / conclusão]', margin, yPos);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Libertá - Formulário gerado em ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );

  return yPos;
};
