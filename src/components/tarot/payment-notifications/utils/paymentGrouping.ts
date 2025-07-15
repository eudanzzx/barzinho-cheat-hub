import { PlanoMensal, PlanoSemanal } from "@/types/payment";

export interface GroupedPayment {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  totalPayments: number;
}

export const groupPaymentsByClient = (payments: (PlanoMensal | PlanoSemanal)[]): GroupedPayment[] => {
  // **Prevent multiple payments with same dueDate per client**
  const clientGroups = new Map<string, (PlanoMensal | PlanoSemanal)[]>();

  payments.forEach(payment => {
    const existing = clientGroups.get(payment.clientName) || [];
    // Só adiciona se não houver outro pagamento ativo do mesmo tipo, prazo e analysisId + dueDate
    const isDuplicate = existing.some(
      p =>
        p.dueDate === payment.dueDate &&
        p.type === payment.type &&
        p.analysisId === payment.analysisId
    );
    if (!isDuplicate) {
      existing.push(payment);
    }
    clientGroups.set(payment.clientName, existing);
  });

  const groupedPayments: GroupedPayment[] = [];

  clientGroups.forEach((clientPayments, clientName) => {
    // Mantém ordenado mais próximo primeiro
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

  // Ordena todos clientes pelo vencimento mais próximo do maisUrgent deles e limita a 20
  return groupedPayments
    .sort((a, b) =>
      new Date(a.mostUrgent.dueDate).getTime() - new Date(b.mostUrgent.dueDate).getTime()
    )
    .slice(0, 20);
};
