
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { generateFormHeader } from './tarot-form/FormHeaderGenerator';
import { generateClientInfo } from './tarot-form/ClientInfoGenerator';
import { generateAnalysisData } from './tarot-form/AnalysisDataGenerator';
import { generatePlanData } from './tarot-form/PlanDataGenerator';
import { generateAnalysisContent } from './tarot-form/AnalysisContentGenerator';
import { generateTreatmentContent } from './tarot-form/TreatmentContentGenerator';

interface IndividualTarotFormGeneratorProps {
  analise: any;
  clientName: string;
  className?: string;
}

const IndividualTarotFormGenerator: React.FC<IndividualTarotFormGeneratorProps> = ({ 
  analise, 
  clientName, 
  className 
}) => {
  const gerarFormularioAnalise = () => {
    try {
      const doc = new jsPDF();

      let yPos = generateFormHeader(doc, clientName);
      yPos = generateClientInfo(doc, analise, clientName, yPos);
      yPos = generateAnalysisData(doc, analise, yPos);
      yPos = generatePlanData(doc, analise, yPos);
      yPos = generateAnalysisContent(doc, analise, yPos);
      generateTreatmentContent(doc, analise, yPos);

      const analysisDate = analise?.dataInicio ? format(new Date(analise.dataInicio), 'dd-MM-yyyy') : 'sem-data';
      doc.save(`formulario-tarot-${clientName.replace(/\s+/g, '-').toLowerCase()}-${analysisDate}.pdf`);
      toast.success(`Formulário individual gerado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao gerar formulário individual:', error);
      toast.error('Erro ao gerar formulário individual.');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`text-xs justify-start text-[#673193] hover:bg-[#673193]/10 ${className}`}
      onClick={gerarFormularioAnalise}
    >
      <FileText className="h-3 w-3 mr-2" />
      {analise?.dataInicio ? format(new Date(analise.dataInicio), 'dd/MM/yyyy') : 'Análise'} - R$ {parseFloat(analise?.preco || "150").toFixed(2)}
    </Button>
  );
};

export default IndividualTarotFormGenerator;
