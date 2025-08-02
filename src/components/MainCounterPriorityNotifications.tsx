
import React, { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { MainClientPaymentGroupNew } from "@/components/main-payment-notifications/MainClientPaymentGroupNew";
import PaymentDetailsModal from "@/components/PaymentDetailsModal";
import { useMainPaymentNotifications } from "@/hooks/useMainPaymentNotifications";

interface MainCounterPriorityNotificationsProps {
  atendimentos: any[];
}

const MainCounterPriorityNotifications: React.FC<MainCounterPriorityNotificationsProps> = memo(({
  atendimentos,
}) => {
  // Componente totalmente desabilitado para página principal
  // Mantido apenas para uso no modal do DashboardHeader
  return null;
});

MainCounterPriorityNotifications.displayName = 'MainCounterPriorityNotifications';

export default MainCounterPriorityNotifications;
