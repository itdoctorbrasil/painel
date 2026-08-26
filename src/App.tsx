import React, { useState, useEffect } from 'react';
import { 
  User, 
  AppLayout, 
  ClientDevice, 
  OtaVersion 
} from './types';
import { 
  loginApi, 
  getResellersApi, 
  saveResellerApi, 
  deleteResellerApi, 
  getGlobalStatsApi, 
  getOtaVersionApi, 
  saveOtaVersionApi, 
  getLayoutApi, 
  saveLayoutApi, 
  getClientsApi, 
  saveClientApi, 
  renewClientApi, 
  deleteClientApi 
} from './services/api';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ImpersonationBanner } from './components/layout/ImpersonationBanner';

import { GlobalStats } from './components/master/GlobalStats';
import { ResellerManagement } from './components/master/ResellerManagement';
import { OtaManagement } from './components/master/OtaManagement';

import { BackgroundEditor } from './components/reseller/BackgroundEditor';
import { AppGridEditor } from './components/reseller/AppGridEditor';
import { ClientManagement } from './components/reseller/ClientManagement';
import { ApiTester } from './components/reseller/ApiTester';

import { LogIn, Lock, Mail } from 'lucide-react';

export default function App() {
  // 1. Persistência de Sessão: Recupera o usuário do localStorage ao recarregar (F5)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('luna_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // 2. Sincronização de Abas com a URL (Resolve a seta "Voltar" do navegador)
  const [activeTab, setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });

  // Estado para controlar o filtro ao navegar para a aba de Clientes via cards
  const [clientFilter, setClientFilter] = useState<'all' | 'active' | 'expired'>('all');

  // Master impersonation / view mode
  const [activeResellerView, setActiveResellerView] = useState<User | null>(null);

  // Data state
  const [resellers, setResellers] = useState<(User & { totalClients: number; activeClients: number })[]>([]);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [otaVersion, setOtaVersion] = useState<OtaVersion | null>(null);
  const [layout, setLayout] = useState<AppLayout | null>(null);
  const [clients, setClients] = useState<ClientDevice[]>([]);

  // Tester prefilled token
  const [initialTestToken, setInitialTestToken] = useState<string | undefined>(undefined);

  // Salva ou remove o usuário do localStorage quando logar/deslogar
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('luna_current_user', JSON.stringify(currentUser));
      loadAllData(currentUser);
    } else {
      localStorage.removeItem('luna_current_user');
    }
  }, [currentUser]);

  // Função centralizada para mudar de aba atualizando a URL (Histórico do navegador)
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({ tab }, '', url.toString());
  };

  // Escuta os botões "Voltar / Avançar" do navegador
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'dashboard';
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await loginApi(email.trim(), password.trim());
      setCurrentUser(res.user);
      handleTabChange('dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveResellerView(null);
    localStorage.removeItem('luna_current_user');
    setEmail('');
    setPassword('');
  };

  // Centralized data loader
  const loadAllData = async (user: User) => {
    try {
      if (user.role === 'master') {
        const [resList, statsData, otaData, clientsData] = await Promise.all([
          getResellersApi(),
          getGlobalStatsApi(),
          getOtaVersionApi(),
          getClientsApi()
        ]);
        setResellers(resList);
        setGlobalStats(statsData);
        setOtaVersion(otaData);
        setClients(clientsData);

        const targetId = activeResellerView ? activeResellerView.id : user.id;
        try {
          const lay = await getLayoutApi(targetId);
          setLayout(lay);
        } catch (e) {
          setLayout(null);
        }
      } else {
        const [otaData, layData, clientsData] = await Promise.all([
          getOtaVersionApi(),
          getLayoutApi(user.id),
          getClientsApi(user.id)
        ]);
        setOtaVersion(otaData);
        setLayout(layData);
        setClients(clientsData);
      }
    } catch (err) {
      console.error("Error loading panel data:", err);
    }
  };

  // Reload layout when activeResellerView changes
  useEffect(() => {
    if (currentUser) {
      const targetId = activeResellerView ? activeResellerView.id : currentUser.id;
      getLayoutApi(targetId)
        .then(lay => setLayout(lay))
        .catch(() => setLayout(null));

      if (currentUser.role === 'master' && !activeResellerView) {
        getClientsApi().then(c => setClients(c));
      } else {
        getClientsApi(targetId).then(c => setClients(c));
      }
    }
  }, [activeResellerView, currentUser]);

  // Master Handlers
  const handleSaveReseller = async (data: Partial<User>) => {
    await saveResellerApi(data);
    if (currentUser) loadAllData(currentUser);
  };

  const handleDeleteReseller = async (id: string) => {
    await deleteResellerApi(id);
    if (activeResellerView?.id === id) setActiveResellerView(null);
    if (currentUser) loadAllData(currentUser);
  };

  const handleSaveOtaVersion = async (data: Partial<OtaVersion>) => {
    const updated = await saveOtaVersionApi(data);
    setOtaVersion(updated);
    if (currentUser) loadAllData(currentUser);
  };

  // Layout Handlers
  const handleSaveLayout = async (layoutData: Partial<AppLayout>) => {
    const updated = await saveLayoutApi(layoutData);
    setLayout(updated);
  };

  // Client Handlers
  const handleSaveClient = async (clientData: any) => {
    await saveClientApi(clientData);
    if (currentUser) loadAllData(currentUser);
  };

  const handleRenewClient = async (id: string, days: number) => {
    await renewClientApi(id, days);
    if (currentUser) loadAllData(currentUser);
  };

  const handleDeleteClient = async (id: string) => {
    await deleteClientApi(id);
    if (currentUser) loadAllData(currentUser);
  };

  // Quick Open API Tester with Token
  const handleOpenApiTester = (token: string) => {
    setInitialTestToken(token);
    handleTabChange('api_tester');
  };

  // Render Login View if unauthenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 p-4 relative overflow-hidden font-sans">
        
        {/* Background ambient lighting */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full mx-auto my-auto py-12 relative z-10">
          
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-500/30 mb-4">
              L
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              LUNA <span className="text-indigo-400">LAUNCHER</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Painel Luna Launcher
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Entrar na sua Conta</h2>

            {loginError && (
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs mb-4">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@dominio.com"
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loginLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar no Painel</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] text-slate-500 mt-6">
            Luna Launcher Painel
          </p>
        </div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* Sidebar Navigation - Passamos handleTabChange para atualizar o histórico */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
        activeResellerView={activeResellerView}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Impersonation Banner for Master */}
        <ImpersonationBanner
          currentUser={currentUser}
          activeResellerView={activeResellerView}
          onExitImpersonation={() => setActiveResellerView(null)}
        />

        {/* Top Header */}
        <Header
          currentUser={currentUser}
          activeTab={activeTab}
          resellers={resellers}
          activeResellerView={activeResellerView}
          onSelectResellerView={(res) => setActiveResellerView(res)}
          otaVersion={otaVersion || undefined}
          onOpenOtaModal={() => handleTabChange('ota')}
        />

        {/* Dynamic Tab Body */}
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          
          {/* 1. Global Dashboard / Reseller Dashboard */}
          {activeTab === 'dashboard' && (
            currentUser.role === 'master' && !activeResellerView ? (
              <GlobalStats
                stats={globalStats}
                resellers={resellers}
                onNavigateToTab={(tab) => handleTabChange(tab)}
              />
            ) : (
              /* DASHBOARD / VISÃO GERAL DA REVENDA (Métricas e Atalhos) */
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
                      Painel de Controle da Revenda
                    </span>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Visão Geral: {activeResellerView ? activeResellerView.name : currentUser.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Acompanhe abaixo o resumo dos seus dispositivos ativos, expirados e o status geral da sua revenda.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setClientFilter('all');
                      handleTabChange('clients');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    Gerenciar Meus Clientes
                  </button>
                </div>

                {/* Cards Interativos da Revenda Alinhados */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Card 1: Total */}
                  <div 
                    onClick={() => {
                      setClientFilter('all');
                      handleTabChange('clients');
                    }}
                    className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 p-6 rounded-2xl shadow-xl transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-slate-400 text-xs font-mono uppercase tracking-wider group-hover:text-indigo-300 transition block mb-2">
                        Total de Dispositivos ➔
                      </span>
                      <h3 className="text-4xl font-black text-white">
                        {clients.filter(c => c.resellerId === (activeResellerView ? activeResellerView.id : currentUser.id)).length}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">TV Boxes e Smart TVs cadastradas</p>
                  </div>

                  {/* Card 2: Ativos */}
                  <div 
                    onClick={() => {
                      setClientFilter('active');
                      handleTabChange('clients');
                    }}
                    className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 p-6 rounded-2xl shadow-xl transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-emerald-400 text-xs font-mono uppercase tracking-wider group-hover:underline block mb-2">
                        Assinaturas Ativas ➔
                      </span>
                      <h3 className="text-4xl font-black text-emerald-400">
                        {clients.filter(c => c.resellerId === (activeResellerView ? activeResellerView.id : currentUser.id) && c.status === 'active' && new Date(c.expirationDate) >= new Date()).length}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">Dispositivos com acesso liberado</p>
                  </div>

                  {/* Card 3: Expirados */}
                  <div 
                    onClick={() => {
                      setClientFilter('expired');
                      handleTabChange('clients');
                    }}
                    className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 p-6 rounded-2xl shadow-xl transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-rose-400 text-xs font-mono uppercase tracking-wider group-hover:underline block mb-2">
                        Expirados / Bloqueados ➔
                      </span>
                      <h3 className="text-4xl font-black text-rose-400">
                        {clients.filter(c => c.resellerId === (activeResellerView ? activeResellerView.id : currentUser.id) && (c.status === 'expired' || c.status === 'suspended' || new Date(c.expirationDate) < new Date())).length}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">Exigem renovação de plano</p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* 2. Resellers Management (Master only) */}
          {activeTab === 'resellers' && (
            <ResellerManagement
              resellers={resellers}
              onSaveReseller={handleSaveReseller}
              onDeleteReseller={handleDeleteReseller}
              onSelectResellerForImpersonation={(res) => {
                setActiveResellerView(res);
                handleTabChange('dashboard');
              }}
            />
          )}

          {/* 3. OTA Updates Management (Master only) */}
          {activeTab === 'ota' && otaVersion && (
            <OtaManagement
              otaVersion={otaVersion}
              onSaveOtaVersion={handleSaveOtaVersion}
            />
          )}

          {/* 4. All Clients View (Master) OR Clients View (Reseller) */}
          {(activeTab === 'all_clients' || activeTab === 'clients') && (
            <ClientManagement
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              clients={clients}
              onSaveClient={handleSaveClient}
              onRenewClient={handleRenewClient}
              onDeleteClient={handleDeleteClient}
              onOpenApiTester={handleOpenApiTester}
              initialStatusFilter={clientFilter}
            />
          )}

          {/* 5. Gerenciamento Isolado de Backgrounds */}
          {activeTab === 'background_editor' && (
            <BackgroundEditor
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              layout={layout}
              onSaveLayout={handleSaveLayout}
            />
          )}

          {/* 6. Gerenciamento Isolado da Grade de Apps */}
          {activeTab === 'apps_editor' && (
            <AppGridEditor
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              layout={layout}
              onSaveLayout={handleSaveLayout}
            />
          )}

          {/* 7. API Tester & Documentation */}
          {activeTab === 'api_tester' && (
            <ApiTester
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              clients={clients}
              initialTestToken={initialTestToken}
            />
          )}
        </main>
      </div>
    </div>
  );
}
