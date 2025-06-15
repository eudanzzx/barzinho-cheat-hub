
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export interface GroupedPayment {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  totalPayments: number;
}

export const groupPaymentsByClient = (payments: (PlanoMensal | PlanoSemanal)[]): GroupedPayment[] => {
  const clientGroups = new Map<string, (PlanoMensal | PlanoSemanal)[]>();
  
  payments.forEach(payment => {
    const existing = clientGroups.get(payment.clientName) || [];
    existing.push(payment);
    clientGroups.set(payment.clientName, existing);
  });

  const groupedPayments: GroupedPayment[] = [];
  
  clientGroups.forEach((clientPayments, clientName) => {
    const sortedPayments = clientPayments.sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    const mostUrgent = sortedPayments[0];
    const additionalPayments = sortedPayments.slice(1);

    groupedPayments.push({
      clientName,
      mostUrgent,
      additionalPayments,
      totalPayments: sortedPayments.length
    });
  });

  return groupedPayments.sort((a, b) => 
    new Date(a.mostUrgent.dueDate).getTime() - new Date(b.mostUrgent.dueDate).getTime()
  );
};
