
export interface BasePlano {
  id: string;
  clientName: string;
  type: 'plano' | 'semanal';
  amount: number;
  dueDate: string;
  created: string;
  active: boolean | string; // Allow both boolean and string types
  analysisId?: string; // Optional field to link payments to tarot analyses
  notificationTiming?: 'on_due_date' | 'next_week' | '1_day_before' | '2_days_before' | '3_days_before' | '7_days_before'; // Extended notification timing options
}

export interface PlanoMensal extends BasePlano {
  type: 'plano';
  month: number;
  totalMonths: number;
}

export interface PlanoSemanal extends BasePlano {
  type: 'semanal';
  week: number;
  totalWeeks: number;
}

export type Plano = PlanoMensal | PlanoSemanal;
