
import React from "react";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import ClientBirthdayAlert from "@/components/ClientBirthdayAlert";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AtendimentoForm from "@/components/forms/AtendimentoForm";
import NovoAtendimentoHeader from "@/components/pages/NovoAtendimento/NovoAtendimentoHeader";
import NovoAtendimentoFooter from "@/components/pages/NovoAtendimento/NovoAtendimentoFooter";
import useAtendimentoForm from "@/hooks/useAtendimentoForm";
import { useAtendimentoSave } from "@/hooks/useAtendimentoSave";

const NovoAtendimento = () => {
  const { handleSaveAndFinish } = useAtendimentoSave();
  
  const {
    formData,
    dataNascimento,
    signo,
    atencao,
    planoAtivo,
    semanalAtivo,
    planoData,
    semanalData,
    handleInputChange,
    handleSelectChange,
    handlePlanoDataChange,
    handleSemanalDataChange,
    handleDataNascimentoChange,
    setAtencao,
    setPlanoAtivo,
    setSemanalAtivo,
  } = useAtendimentoForm();

  const onSave = () => {
    handleSaveAndFinish({
      formData,
      signo,
      atencao,
      planoAtivo,
      planoData,
      semanalAtivo,
      semanalData
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F7FF]">
      <DashboardHeader />
      <BirthdayNotifications checkOnMount={false} />
      
      <div className="container mx-auto px-4 py-6 mt-20">
        <NovoAtendimentoHeader />

        <ClientBirthdayAlert 
          clientName={formData.nome}
          birthDate={formData.dataNascimento}
          context="atendimento"
        />

        <AtendimentoForm
          formData={formData}
          dataNascimento={dataNascimento}
          signo={signo}
          atencao={atencao}
          planoAtivo={planoAtivo}
          semanalAtivo={semanalAtivo}
          planoData={planoData}
          semanalData={semanalData}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onDataNascimentoChange={handleDataNascimentoChange}
          onAtencaoChange={setAtencao}
          onPlanoAtivoChange={setPlanoAtivo}
          onSemanalAtivoChange={setSemanalAtivo}
          onPlanoDataChange={handlePlanoDataChange}
          onSemanalDataChange={handleSemanalDataChange}
        />

        <NovoAtendimentoFooter onSave={onSave} />
      </div>
    </div>
  );
};

export default NovoAtendimento;
