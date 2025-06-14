
import React from 'react';

interface PaymentControlsSectionProps {
  onOpenMonthlyPayments: () => void;
  onOpenWeeklyPayments: () => void;
}

const PaymentControlsSection: React.FC<PaymentControlsSectionProps> = ({
  onOpenMonthlyPayments,
  onOpenWeeklyPayments
}) => {
  // Retorna null para garantir que nada seja renderizado
  return null;
};

export default PaymentControlsSection;
