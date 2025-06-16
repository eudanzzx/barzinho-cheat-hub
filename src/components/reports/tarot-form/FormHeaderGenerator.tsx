
import React from 'react';
import { jsPDF } from 'jspdf';

export const generateFormHeader = (doc: jsPDF, clientName: string) => {
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 25;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(103, 49, 147);
  doc.text('FORMULÁRIO DE ANÁLISE - TAROT', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  doc.setFontSize(12);
  doc.setTextColor(120, 120, 120);
  doc.text('Documento confidencial - Uso exclusivo do cliente', pageWidth / 2, yPos, { align: 'center' });
  yPos += 25;

  return yPos;
};
