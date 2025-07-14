import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { TarotReportPdfGenerator, ClientData } from './TarotReportPdfGenerator';

interface OptimizedIndividualTarotReportGeneratorProps {
  cliente: ClientData;
  className?: string;
}

const OptimizedIndividualTarotReportGenerator = memo<OptimizedIndividualTarotReportGeneratorProps>(({ 
  cliente, 
  className 
}) => {
  const gerarRelatorioIndividual = useCallback(() => {
    try {
      const generator = new TarotReportPdfGenerator();
      generator.saveReport(cliente);
      toast.success(`Relatório individual para ${cliente.nome} gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar relatório individual:', error);
      toast.error('Erro ao gerar relatório. Verifique os dados do cliente.');
    }
  }, [cliente]);

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
});

OptimizedIndividualTarotReportGenerator.displayName = 'OptimizedIndividualTarotReportGenerator';

export default OptimizedIndividualTarotReportGenerator;