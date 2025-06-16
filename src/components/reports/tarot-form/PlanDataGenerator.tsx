
import React from 'react';
import { jsPDF } from 'jspdf';

export const generatePlanData = (doc: jsPDF, analise: any, yPos: number) => {
  const margin = 20;

  // PLANO CONTRATADO
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.text('PLANO CONTRATADO', margin, yPos);
  yPos += 15;

  doc.setFontSize(11);

  // Tipo de Plano
  doc.setFont(undefined, 'bold');
  doc.text('Tipo de Plano: PLANO SEMANAL', margin, yPos);
  yPos += 12;

  // Duração
  doc.setFont(undefined, 'bold');
  const semanas = analise?.semanas || '4';
  doc.text(`Duração: ${semanas} semanas`, margin, yPos);
  yPos += 12;

  // Valor Total
  doc.setFont(undefined, 'bold');
  const valorSemanal = parseFloat(analise?.valorSemanal || "40");
  const totalSemanas = parseInt(semanas);
  const valorTotal = valorSemanal * totalSemanas;
  doc.text(`Valor Total: R$ ${valorTotal.toFixed(2)}`, margin, yPos);
  yPos += 12;

  // Valor por Semana
  doc.setFont(undefined, 'bold');
  doc.text(`Valor por Semana: R$ ${valorSemanal.toFixed(2)}`, margin, yPos);
  yPos += 20;

  return yPos;
};
