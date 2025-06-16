
import React from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatarDataSegura = (data: string) => {
  if (!data || data.trim() === '') {
    return '_____/_____/_____';
  }
  
  try {
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
      return '_____/_____/_____';
    }
    return format(dataObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    return '_____/_____/_____';
  }
};

export const generateClientInfo = (doc: jsPDF, analise: any, clientName: string, yPos: number) => {
  const margin = 20;

  // Informações do Cliente
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMAÇÕES DO CLIENTE', margin, yPos);
  yPos += 15;

  doc.setFontSize(11);

  // Nome e Data de Nascimento
  doc.setFont(undefined, 'bold');
  doc.text(`Nome do Cliente: ${clientName || ''}`, margin, yPos);

  doc.setFont(undefined, 'bold');
  const dataNasc = analise?.dataNascimento ? formatarDataSegura(analise.dataNascimento) : '_____/_____/_____';
  doc.text(`Data de Nascimento: ${dataNasc}`, margin + 110, yPos);
  yPos += 12;

  // Signo e Telefone
  doc.setFont(undefined, 'bold');
  doc.text(`Signo: ${analise?.signo || ''}`, margin, yPos);

  if (analise?.telefone) {
    doc.setFont(undefined, 'bold');
    doc.text(`Telefone: ${analise.telefone}`, margin + 110, yPos);
  }
  yPos += 20;

  return yPos;
};
