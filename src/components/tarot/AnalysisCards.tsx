
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AnalysisCardsProps {
  analiseAntes: string;
  analiseDepois: string;
  onAnaliseAntesChange: (value: string) => void;
  onAnaliseDepoisChange: (value: string) => void;
  value?: string;
  onChange?: (value: string) => void;
}

const AnalysisCards: React.FC<AnalysisCardsProps> = memo(({
  analiseAntes,
  analiseDepois,
  onAnaliseAntesChange,
  onAnaliseDepoisChange,
  value,
  onChange
}) => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white/50 border-slate-200/50">
        <CardHeader className="bg-slate-50/80 py-3">
          <CardTitle className="text-lg text-tarot-primary">ANÁLISE - ANTES</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea 
            placeholder="Descreva a situação antes do tratamento..." 
            className="min-h-[150px] bg-white/50 border-slate-200 focus:border-tarot-primary focus:ring-tarot-primary/20 transition-colors duration-200"
            value={analiseAntes}
            onChange={(e) => onAnaliseAntesChange(e.target.value)}
          />
        </CardContent>
      </Card>
      
      <Card className="bg-white/50 border-slate-200/50">
        <CardHeader className="bg-slate-50/80 py-3">
          <CardTitle className="text-lg text-tarot-primary">ANÁLISE - DEPOIS</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea 
            placeholder="Descreva os resultados após o tratamento..." 
            className="min-h-[150px] bg-white/50 border-slate-200 focus:border-tarot-primary focus:ring-tarot-primary/20 transition-colors duration-200"
            value={analiseDepois}
            onChange={(e) => onAnaliseDepoisChange(e.target.value)}
          />
        </CardContent>
      </Card>
      
      {value !== undefined && onChange && (
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="text-lg font-semibold">Valor da Consulta</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Input
              type="number"
              placeholder="Ex: 150"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="bg-white/50 border-green-200 focus:border-green-400 focus:ring-green-200"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
});

AnalysisCards.displayName = 'AnalysisCards';

export default AnalysisCards;
