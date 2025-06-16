
import React from 'react';
import ClientBirthdayAlert from "../ClientBirthdayAlert";

interface IndexBirthdaySectionProps {
  aniversarianteHoje: { nome: string; dataNascimento: string } | null;
}

const IndexBirthdaySection: React.FC<IndexBirthdaySectionProps> = ({
  aniversarianteHoje
}) => {
  if (!aniversarianteHoje) return null;

  return (
    <ClientBirthdayAlert 
      clientName={aniversarianteHoje.nome}
      birthDate={aniversarianteHoje.dataNascimento}
      context="atendimento"
    />
  );
};

export default IndexBirthdaySection;
