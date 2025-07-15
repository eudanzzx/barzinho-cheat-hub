
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Home, ChevronDown, Users, Menu, Bell, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePaymentNotifications } from "@/components/tarot/payment-notifications/usePaymentNotifications";
import TarotPriorityPaymentsModal from "@/components/TarotPriorityPaymentsModal";
import useUserDataService from "@/services/userDataService";
import TratamentoContadoresModal from "@/components/tarot/TratamentoContadoresModal";
import MainPriorityPaymentsModal from "./MainPriorityPaymentsModal";

const DashboardHeader = () => {
  const [openTratamentoContadores, setOpenTratamentoContadores] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isDashboardPage = location.pathname === '/' || location.pathname === '/dashboard';
  const isTarotPage = location.pathname === '/listagem-tarot' || location.pathname === '/analise-frequencial' || location.pathname === '/relatorio-frequencial' || location.pathname.includes('tarot');
  const isTarotListagem = location.pathname === '/listagem-tarot';

  const { groupedPayments } = usePaymentNotifications();
  const totalClients = groupedPayments.length;

  const { getAllTarotAnalyses, getAtendimentos } = useUserDataService();
  const analisesTarot = isTarotListagem ? getAllTarotAnalyses() : [];
  const atendimentos = isDashboardPage ? getAtendimentos() : [];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo e título - responsivo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Logo height={isMobile ? 28 : 36} width={isMobile ? 28 : 36} />
              <div className="min-w-0">
                <h1 className={`text-sm sm:text-lg font-medium truncate ${isTarotPage ? 'text-tarot-primary' : 'text-main-primary'}`}>
                  {isMobile ? 'Libertá' : 'Libertá Espaço Terapêutico'}
                </h1>
                <span className="text-gray-500 text-xs hidden sm:block">Sistema de Atendimentos</span>
              </div>
            </div>
            
            {/* Botões de ação - responsivo */}
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              {/* Botão de próximos vencimentos - apenas na página principal */}
              {isDashboardPage && (
                <MainPriorityPaymentsModal atendimentos={atendimentos} />
              )}

              {/* Botões específicos do tarot */}
              {isTarotListagem && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size={isMobile ? "sm" : "default"}
                    className="flex items-center gap-1 text-violet-700 bg-violet-100 hover:bg-violet-200 px-2 py-1 sm:px-2 sm:py-2 rounded-xl font-bold shadow border border-violet-200"
                    title="Ver contadores de tratamento"
                    onClick={() => setOpenTratamentoContadores(true)}
                  >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[#8e46dd]" />
                    <span className="hidden sm:inline text-xs sm:text-sm">Contadores</span>
                  </Button>
                  <TratamentoContadoresModal
                    open={openTratamentoContadores}
                    onOpenChange={setOpenTratamentoContadores}
                  />
                  <TarotPriorityPaymentsModal analises={analisesTarot} />
                </div>
              )}

              {isMobile ? (
                /* Menu mobile */
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg z-[60]">
                      {!isDashboardPage && (
                        <DropdownMenuItem onClick={() => navigate('/')}>
                          <Home className="h-4 w-4 mr-2" />
                          Início
                        </DropdownMenuItem>
                      )}
                      {!isTarotPage && (
                        <DropdownMenuItem onClick={() => navigate('/listagem-tarot')}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Tarot
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => navigate(isTarotPage ? '/relatorio-individual-tarot' : '/relatorio-individual')}>
                        <Users className="h-4 w-4 mr-2" />
                        Relatórios Individuais
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    size="sm"
                    className={`text-white h-8 px-2 text-xs ${
                      isTarotPage ? 'bg-tarot-primary hover:bg-tarot-primary-light' : 'bg-main-primary hover:bg-main-primary-light'
                    }`}
                    onClick={() => navigate(isTarotPage ? '/analise-frequencial' : '/novo-atendimento')}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <UserMenu />
                </div>
              ) : (
                /* Menu desktop */
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
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => navigate(isTarotPage ? '/relatorio-individual-tarot' : '/relatorio-individual')}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Relatórios
                  </Button>
                  
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
