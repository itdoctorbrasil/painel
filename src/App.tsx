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

import { LayoutEditor } from './components/reseller/LayoutEditor';
import { ClientManagement } from './components/reseller/ClientManagement';
import { ApiTester } from './components/reseller/ApiTester';

import { LogIn, Lock, Mail, Tv } from 'lucide-react';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // App Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await loginApi(email.trim(), password.trim());
      setCurrentUser(res.user);
      loadAllData(res.user);
    } catch (err: any) {
      setLoginError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveResellerView(null);
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
    setActiveTab('api_tester');
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
              Painel Web Multitenant (SaaS / White-Label) para Android IPTV
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
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
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
            Luna Launcher IPTV SaaS v2.1.0 • Sistema Multi-Inquilino Seguro
          </p>
        </div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
          onOpenOtaModal={() => setActiveTab('ota')}
        />

        {/* Dynamic Tab Body */}
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          
          {/* 1. Global Dashboard / Reseller Dashboard */}
          {activeTab === 'dashboard' && (
            currentUser.role === 'master' && !activeResellerView ? (
              <GlobalStats
                stats={globalStats}
                resellers={resellers}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            ) : (
              <ClientManagement
                currentUser={currentUser}
                activeResellerView={activeResellerView}
                clients={clients}
                onSaveClient={handleSaveClient}
                onRenewClient={handleRenewClient}
                onDeleteClient={handleDeleteClient}
                onOpenApiTester={handleOpenApiTester}
              />
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
                setActiveTab('layout_editor');
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
            />
          )}

          {/* 5. Layout Editor (5 Apps + Background TV) */}
          {activeTab === 'layout_editor' && (
            <LayoutEditor
              currentUser={currentUser}
              activeResellerView={activeResellerView}
              layout={layout}
              onSaveLayout={handleSaveLayout}
            />
          )}

          {/* 6. API Tester & Documentation */}
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
