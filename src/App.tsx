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
import { AppLayoutsEditor } from './components/reseller/AppLayoutsEditor';
import { ClientManagement } from './components/reseller/ClientManagement';
import { ApiTester } from './components/reseller/ApiTester';
import { WhatsappConfig } from './components/reseller/WhatsappConfig';
import { LogoConfig } from './components/reseller/LogoConfig';
import { BootVideoConfig } from './components/reseller/BootVideoConfig'; // <--- Novo componente de Bootvideo importado

import { LogIn, Lock, Mail, AlertTriangle } from 'lucide-react';

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
  const [expiredModalMessage, setExpiredModalMessage] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // 2. Sincronização de Abas com a URL
  const [activeTab, setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });

  const [clientFilter, setClientFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [activeResellerView, setActiveResellerView] = useState<User | null>(null);

  const [resellers, setResellers] = useState<(User & { totalClients: number; activeClients: number })[]>([]);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [otaVersion, setOtaVersion] = useState<OtaVersion | null>(null);
  const [layout, setLayout] = useState<AppLayout | null>(null);
  const [clients, setClients] = useState<ClientDevice[]>([]);

  const [initialTestToken, setInitialTestToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('luna_current_user', JSON.stringify(currentUser));
      loadAllData(currentUser);
    } else {
      localStorage.removeItem('luna_current_user');
    }
  }, [currentUser]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({ tab }, '', url.toString());
  };

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
    setExpiredModalMessage(null);
    try {
      const res = await loginApi(email.trim(), password.trim());
      setCurrentUser(res.user);
      handleTabChange('dashboard');
    } catch (err: any) {
      if (err.expired) {
        setExpiredModalMessage(err.message || 'Seus acessos estão expirados, entre em contato com o administrador do painel');
      } else {
        setLoginError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }
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

  const handleSaveLayout = async (layoutData: Partial<AppLayout>) => {
    const updated = await saveLayoutApi(layoutData);
    setLayout(updated);
  };

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

  // Atualiza o estado global do usuário ao salvar o WhatsApp/QR Code
  const handleUpdateWhatsappConfig = (newWhatsapp: string, newShowWhatsapp: boolean) => {
    if (activeResellerView) {
      const updated = { ...activeResellerView, whatsapp: newWhatsapp, showWhatsapp: newShowWhatsapp };
      setActiveResellerView(updated);
    } else if (currentUser) {
      const updated = { ...currentUser, whatsapp: newWhatsapp, showWhatsapp: newShowWhatsapp };
      setCurrentUser(updated);
    }
  };

  const handleOpenApiTester = (token: string) => {
    setInitialTestToken(token);
    handleTabChange('api_tester');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 p-4 relative overflow-hidden font-sans">
        
        {/* Modal de Tela Cheia para Contas Expiradas */}
        {expiredModalMessage && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-6 text-center">
            <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 p-8 rounded-3xl shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="w-20 h-20 bg-rose-500/20 border border-rose-500/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Acesso Expirado</h2>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {expiredModalMessage}
              </p>
              <button
                onClick={() => setExpiredModalMessage(null)}
                className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow-lg cursor-pointer"
              >
                Voltar à Tela de Login
              </button>
            </div>
          </div>
        )}

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full mx-auto my-auto py-12 relative z-10">
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
        activeResellerView={activeResellerView}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <ImpersonationBanner
          currentUser={currentUser}
          activeResellerView={activeResellerView}
          onExitImpersonation={() => setActiveResellerView(null)}
        />

        <Header
          currentUser={currentUser}
          activeTab={activeTab}
          resellers={resellers}
          activeResellerView={activeResellerView}
          onSelectResellerView={(res) => setActiveResellerView(res)}
          otaVersion={otaVersion || undefined}
          onOpenOtaModal={() => handleTabChange('ota')}
        />

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            currentUser.role === 'master' && !activeResellerView ? (
              <GlobalStats
                stats={globalStats}
                resellers={resellers}
                onNavigateToTab={(tab) => handleTabChange(tab)}
              />
            ) : (
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
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

          {activeTab === 'ota' && (
            currentUser.role === 'master' && !activeResellerView && otaVersion ? (
              <OtaManagement
                otaVersion={otaVersion}
                onSaveOtaVersion={handleSaveOtaVersion}
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto mt-12 shadow-2xl">
                <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                  🔒
                </div>
                <h3 className="text-xl font-black text-white">Acesso Restrito</h3>
                <p className="text-xs text-slate-400">
                  Esta seção de gerenciamento de atualizações OTA é exclusiva para o Administrador Master do sistema.
                </p>
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Voltar para a Visão Geral
                </button>
              </div>
            )
          )}

          {(activeTab === 'all_clients' || activeTab === 'clients') && (
            <ClientManagement
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              clients={clients}
              layout={layout}
              onSaveClient={handleSaveClient}
              onRenewClient={handleRenewClient}
              onDeleteClient={handleDeleteClient}
              onOpenApiTester={handleOpenApiTester}
              initialStatusFilter={clientFilter}
            />
          )}

          {activeTab === 'background_editor' && (
            <BackgroundEditor
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              layout={layout}
              onSaveLayout={handleSaveLayout}
            />
          )}

          {activeTab === 'apps_editor' && (
            <AppGridEditor
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              layout={layout}
              onSaveLayout={handleSaveLayout}
            />
          )}

          {activeTab === 'app_layouts' && (
            <AppLayoutsEditor
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              layout={layout}
              onSaveLayout={handleSaveLayout}
            />
          )}

          {activeTab === 'boot_video' && (
            <BootVideoConfig
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              layout={layout}
              onSaveLayout={handleSaveLayout}
            />
          )}

          {activeTab === 'whatsapp_qr' && (
            <WhatsappConfig
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              onUpdateWhatsapp={handleUpdateWhatsappConfig}
            />
          )}

          {activeTab === 'logo_config' && (
            <LogoConfig
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              layout={layout}
              onSaveLayout={handleSaveLayout}
            />
          )}

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
