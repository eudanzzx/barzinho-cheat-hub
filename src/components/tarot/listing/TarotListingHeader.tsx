
import React from 'react';

const TarotListingHeader: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Análises Frequenciais
        </h1>
        <p className="text-slate-600 mt-1">
          Gerencie suas análises frequenciais
        </p>
      </div>
    </div>
  );
};

export default TarotListingHeader;
