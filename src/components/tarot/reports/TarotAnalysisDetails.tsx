
import React from 'react';

interface TarotAnalysisDetailsProps {
  cliente: any;
}

const TarotAnalysisDetails: React.FC<TarotAnalysisDetailsProps> = ({ cliente }) => {
  return (
    <div className="border-t border-purple-600/20 pt-4">
      <h4 className="font-medium text-purple-600 mb-3">Histórico de Análises</h4>
      <div className="space-y-3">
        {cliente.analises.map((analise: any, idx: number) => (
          <div key={idx} className="bg-purple-50/50 rounded-lg p-3 border border-purple-200/30">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm flex-1">
                <div>
                  <span className="font-medium text-purple-600">Status:</span>
                  <span className="ml-2 text-slate-700">
                    {analise.finalizado ? 'Finalizada' : 'Em andamento'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-purple-600">Valor:</span>
                  <span className="ml-2 text-slate-700">R$ {parseFloat(analise.preco || "0").toFixed(2)}</span>
                </div>
                
                {analise.signo && (
                  <div>
                    <span className="font-medium text-purple-600">Signo:</span>
                    <span className="ml-2 text-slate-700">{analise.signo}</span>
                  </div>
                )}
                
                {analise.nascimento && (
                  <div>
                    <span className="font-medium text-purple-600">Nascimento:</span>
                    <span className="ml-2 text-slate-700">
                      {new Date(analise.nascimento).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {analise.pergunta && (
              <div className="mt-3">
                <span className="font-medium text-purple-600">Pergunta:</span>
                <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border break-words">{analise.pergunta}</p>
              </div>
            )}

            {analise.leitura && (
              <div className="mt-3">
                <span className="font-medium text-purple-600">Leitura:</span>
                <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border break-words">{analise.leitura}</p>
              </div>
            )}

            {analise.orientacao && (
              <div className="mt-3">
                <span className="font-medium text-purple-600">Orientação:</span>
                <p className="mt-1 text-sm text-slate-700 bg-white/50 p-2 rounded border break-words">{analise.orientacao}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TarotAnalysisDetails;
