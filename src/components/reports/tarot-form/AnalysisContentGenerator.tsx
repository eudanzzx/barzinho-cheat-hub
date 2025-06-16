
import React from 'react';
import { jsPDF } from 'jspdf';

export const generateAnalysisContent = (doc: jsPDF, analise: any, yPos: number) => {
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;

  // ANÁLISE - ANTES
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.text('ANÁLISE – ANTES', margin, yPos);
  yPos += 10;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.text('Descreva a situação antes do tratamento:', margin, yPos);
  yPos += 8;

  if (analise?.pergunta) {
    const perguntaLines = doc.splitTextToSize(analise.pergunta, pageWidth - 2 * margin);
    doc.text(perguntaLines, margin, yPos);
    yPos += perguntaLines.length * 5 + 15;
  } else {
    yPos += 20;
  }

  // ANÁLISE - DEPOIS
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.text('ANÁLISE – DEPOIS', margin, yPos);
  yPos += 10;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.text('Descreva os resultados após o tratamento:', margin, yPos);
  yPos += 8;

  if (analise?.leitura) {
    const leituraLines = doc.splitTextToSize(analise.leitura, pageWidth - 2 * margin);
    doc.text(leituraLines, margin, yPos);
    yPos += leituraLines.length * 5 + 15;
  } else {
    yPos += 20;
  }

  return yPos;
};
