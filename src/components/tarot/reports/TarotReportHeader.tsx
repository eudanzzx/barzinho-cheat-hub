
import React from 'react';
import Logo from "@/components/Logo";

const TarotReportHeader = () => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <Logo height={50} width={50} />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#673193]">
            Relatórios Individuais - Tarot
          </h1>
          <p className="text-[#673193] mt-1 opacity-80">Análises por cliente</p>
        </div>
      </div>
    </div>
  );
};

export default TarotReportHeader;
