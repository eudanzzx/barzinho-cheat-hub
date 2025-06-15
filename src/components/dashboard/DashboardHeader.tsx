import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, BarChart3, Home, ChevronDown, Users, Menu, Calendar, Bell, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import PaymentOverviewModal from "@/components/PaymentOverviewModal";
import { Badge } from "@/components/ui/badge";
import { usePaymentNotifications } from "@/components/tarot/payment-notifications/usePaymentNotifications";
import TarotCounterPriorityNotifications from "@/components/TarotCounterPriorityNotifications";
import TarotPriorityNotificationsModal from "./TarotPriorityNotificationsModal";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isDashboardPage = location.pathname === '/' || location.pathname === '/dashboard';
  const isTarotPage = location.pathname === '/listagem-tarot' || location.pathname === '/analise-frequencial' || location.pathname === '/relatorio-frequencial' || location.pathname.includes('tarot');
  const isTarotListagem = location.pathname === '/listagem-tarot';

  // Buscamos notificações de vencimentos do tarot
  const { groupedPayments } = usePaymentNotifications();
  const totalClients = groupedPayments.length;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          {/* Botão de Próximos Vencimentos - Análises de Tarot para /listagem-tarot */}
          {isTarotListagem && (
            <div className="mb-4">
              <TarotPriorityNotificationsModal />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo height={36} width={36} />
              <div>
                <h1 className={`text-lg font-medium ${isTarotPage ? 'text-tarot-primary' : 'text-main-primary'}`}>
                  Libertá Espaço Terapêutico
                </h1>
                <span className="text-gray-500 text-sm hidden sm:block">Sistema de Atendimentos</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isMobile ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {!isDashboardPage && (
                        <DropdownMenuItem onClick={() => navigate('/')}>
                          <Home className="h-4 w-4 mr-2" />
                          Início
                        </DropdownMenuItem>
                      )}
                      {!isTarotPage && (
                        <DropdownMenuItem onClick={() => navigate('/listagem-tarot')}>
                          Tarot
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => navigate(isTarotPage ? '/relatorio-individual-tarot' : '/relatorio-individual')}>
                        <Users className="h-4 w-4 mr-2" />
                        Relatórios Individuais
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(isTarotPage ? '/relatorios-frequenciais-tarot' : '/relatorios-financeiros')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Relatórios Financeiros
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    className={`text-white h-9 px-3 text-sm ${
                      isTarotPage ? 'bg-tarot-primary hover:bg-tarot-primary-light' : 'bg-main-primary hover:bg-main-primary-light'
                    }`}
                    onClick={() => navigate(isTarotPage ? '/analise-frequencial' : '/novo-atendimento')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <UserMenu />
                </div>
              ) : (
                <>
                  {!isDashboardPage && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600 hover:text-main-primary hover:bg-main-accent"
                      onClick={() => navigate('/')}
                    >
                      <Home className="h-4 w-4 mr-1" />
                      Início
                    </Button>
                  )}
                  {!isTarotPage && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600 hover:text-tarot-primary hover:bg-tarot-accent"
                      onClick={() => navigate('/listagem-tarot')}
                    >
                      Tarot
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Relatórios
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate(isTarotPage ? '/relatorio-individual-tarot' : '/relatorio-individual')}>
                        <Users className="h-4 w-4 mr-2" />
                        Relatórios Individuais
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(isTarotPage ? '/relatorios-frequenciais-tarot' : '/relatorios-financeiros')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Relatórios Financeiros
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <PaymentOverviewModal context={isTarotPage ? 'tarot' : 'principal'}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Próximos Vencimentos
                    </Button>
                  </PaymentOverviewModal>
                  
                  <Button 
                    className={`text-white h-9 px-4 text-sm ${
                      isTarotPage ? 'bg-tarot-primary hover:bg-tarot-primary-light' : 'bg-main-primary hover:bg-main-primary-light'
                    }`}
                    onClick={() => navigate(isTarotPage ? '/analise-frequencial' : '/novo-atendimento')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {isTarotPage ? 'Nova Análise' : 'Novo Atendimento'}
                  </Button>
                  <UserMenu />
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default DashboardHeader;
