import React, { memo, useMemo } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimizedDebouncedCallback } from "@/hooks/useOptimizedDebounce";

interface OptimizedAnalysisFieldsProps {
  analiseAntes: string;
  setAnaliseAntes: (value: string) => void;
  analiseDepois: string;
  setAnaliseDepois: (value: string) => void;
}

const OptimizedAnalysisFields: React.FC<OptimizedAnalysisFieldsProps> = memo(({
  analiseAntes,
  setAnaliseAntes,
  analiseDepois,
  setAnaliseDepois
}) => {
  const debouncedAnaliseAntes = useOptimizedDebouncedCallback(setAnaliseAntes, 400);
  const debouncedAnaliseDepois = useOptimizedDebouncedCallback(setAnaliseDepois, 400);

  const handleAnaliseAntesChange = useMemo(() => 
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      debouncedAnaliseAntes(e.target.value);
    }, [debouncedAnaliseAntes]
  );

  const handleAnaliseDepoisChange = useMemo(() => 
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      debouncedAnaliseDepois(e.target.value);
    }, [debouncedAnaliseDepois]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="analiseAntes">Análise (Antes)</Label>
          <Textarea
            id="analiseAntes"
            placeholder="Descreva a situação atual do cliente..."
            defaultValue={analiseAntes}
            onChange={handleAnaliseAntesChange}
            className="min-h-[120px] bg-white/50"
          />
        </div>

        <div>
          <Label htmlFor="analiseDepois">Análise (Depois)</Label>
          <Textarea
            id="analiseDepois"
            placeholder="Descreva as mudanças observadas..."
            defaultValue={analiseDepois}
            onChange={handleAnaliseDepoisChange}
            className="min-h-[120px] bg-white/50"
          />
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedAnalysisFields.displayName = 'OptimizedAnalysisFields';

export default OptimizedAnalysisFields;