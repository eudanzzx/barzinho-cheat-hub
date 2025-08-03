
import React from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatarDataSegura = (data: string) => {
  if (!data || data.trim() === '') {
    return '_____/_____/_____';
  }
  
  try {
    // Usar diretamente a data sem construtor Date para evitar timezone
    const [ano, mes, dia] = data.split('-');
    if (ano && mes && dia) {
      return `${dia}/${mes}/${ano}`;
    }
    return '_____/_____/_____';
  } catch (error) {
    return '_____/_____/_____';
  }
};

export const generateAnalysisData = (doc: jsPDF, analise: any, yPos: number) => {
  const margin = 20;

  // Dados da Análise
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.text('DADOS DA ANÁLISE', margin, yPos);
  yPos += 15;

  doc.setFontSize(11);

  // Data da Análise e Valor
  doc.setFont(undefined, 'bold');
  const dataAnalise = analise?.dataInicio ? formatarDataSegura(analise.dataInicio) : '_____/_____/_____';
  doc.text(`Data da Análise: ${dataAnalise}`, margin, yPos);

  doc.setFont(undefined, 'bold');
  doc.text(`Valor: R$ ${parseFloat(analise?.preco || "150").toFixed(2)}`, margin + 110, yPos);
  yPos += 12;

  // Status
  doc.setFont(undefined, 'bold');
  doc.text(`Status: ${analise?.finalizado ? 'Finalizada' : 'Em andamento'}`, margin, yPos);
  yPos += 20;

  return yPos;
};
