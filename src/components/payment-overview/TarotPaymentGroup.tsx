
import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { PlanoMensal, PlanoSemanal } from "@/types/payment";

interface TarotPaymentGroupProps {
  clientName: string;
  mostUrgent: PlanoMensal | PlanoSemanal;
  additionalPayments: (PlanoMensal | PlanoSemanal)[];
  onMarkAsPaid: (paymentId: string) => void;
}

const TarotPaymentGroup: React.FC<TarotPaymentGroupProps> = ({
  clientName,
  mostUrgent,
  additionalPayments,
  onMarkAsPaid,
}) => {
  // Garante que Collapsible comece fechado SEMPRE ao montar/com mudança de clientName
  const [isOpen, setIsOpen] = useState(false);
  const initialRender = useRef(true);

  useEffect(() => {
    // Sempre fecha o submenu ao montar ou ao mudar o cliente (grupo)
    setIsOpen(false);
    // eslint-disable-next-line
  }, [clientName]);

  // Remove duplicados e o mostUrgent, só para garantir
  const uniqueAdditionalPayments = additionalPayments.filter((p) => p.id !== mostUrgent.id);
  const hasAdditionalPayments = uniqueAdditionalPayments.length > 0;

  function handleCollapsibleChange(open: boolean) {
    setIsOpen(open);
  }

  // O botão Pago só chama a prop, nunca altera o Collapsible
  function handlePagoClick(e: React.MouseEvent) {
    e.stopPropagation(); // Previne bugs de colapso no submenu em clique
    onMarkAsPaid(mostUrgent.id);
  }

  function getUrgencyText(daysUntilDue: number) {
    if (daysUntilDue < 0)
      return `${Math.abs(daysUntilDue)} dia${Math.abs(daysUntilDue) === 1 ? "" : "s"} em atraso`;
    if (daysUntilDue === 0) return "Vence hoje";
    if (daysUntilDue === 1) return "Vence amanhã";
    return `${daysUntilDue} dias restantes`;
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-4 shadow-sm mb-2">
      <Collapsible open={isOpen} onOpenChange={handleCollapsibleChange}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{clientName}</span>
            {hasAdditionalPayments && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                +{uniqueAdditionalPayments.length} vencimento{uniqueAdditionalPayments.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasAdditionalPayments && (
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 p-0"
                  aria-label={isOpen ? "Esconder adicionais" : "Ver adicionais"}
                  tabIndex={0}
                >
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            )}
            <Button
              className="ml-1 px-3 h-8 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-sm flex gap-1 items-center shadow-md transition"
              title="Marcar como pago"
              type="button"
              onClick={handlePagoClick}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Pago
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-[#ceb8fa] bg-[#f6f0ff] shadow-sm p-4 flex flex-col gap-2 relative mb-1">
          <div className="flex justify-between items-center mb-1">
            <Badge
              variant="outline"
              className="border-transparent bg-white/60 text-[#8e46dd] font-semibold px-3 py-1 text-xs"
              style={{ boxShadow: "none" }}
            >
              {mostUrgent.type === "plano" ? "Mensal" : "Semanal"}
            </Badge>
            <span className="text-lg font-bold text-green-600">
              R$ {mostUrgent.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#8e46dd] font-medium">
            <Calendar className="h-4 w-4" />
            <span>
              {(() => {
                const date = new Date(mostUrgent.dueDate);
                return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`;
              })()}
            </span>
          </div>
          <div className="text-sm font-medium text-[#9156e0]">
            {getUrgencyText(getDaysUntilDue(mostUrgent.dueDate))}
          </div>
        </div>
        {hasAdditionalPayments && (
          <CollapsibleContent className="pl-2 pt-1 space-y-1" forceMount>
            {uniqueAdditionalPayments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-xl border border-[#ceb8fa] bg-white shadow-sm p-3 flex flex-col gap-2 relative"
              >
                <div className="flex justify-between items-center mb-1">
                  <Badge
                    variant="outline"
                    className="border-transparent bg-purple-100 text-[#8e46dd] font-semibold px-3 py-1 text-xs"
                    style={{ boxShadow: "none" }}
                  >
                    {payment.type === "plano" ? "Mensal" : "Semanal"}
                  </Badge>
                  <span className="text-base font-bold text-green-600">
                    R$ {payment.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8e46dd] font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {(() => {
                      const date = new Date(payment.dueDate);
                      return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`;
                    })()}
                  </span>
                </div>
                <div className="text-xs font-medium text-[#9156e0]">
                  {getUrgencyText(getDaysUntilDue(payment.dueDate))}
                </div>
              </div>
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
};

export default TarotPaymentGroup;
