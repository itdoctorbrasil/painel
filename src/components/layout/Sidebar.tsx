import React from 'react';
import { User } from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  DownloadCloud, 
  UserCheck, 
  Code2, 
  LogOut, 
  Shield, 
  Image as ImageIcon,
  AppWindow
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  activeResellerView?: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  activeResellerView
}) => {
  const isMaster = currentUser.role === 'master' && !activeResellerView;

  // Menu do Master Admin
  const masterNav = [
    { id: 'dashboard', label: 'Estatísticas Globais', icon: LayoutDashboard },
    { id: 'resellers', label: 'Revendedores', icon: Users },
    { id: 'ota', label: 'Atualizações OTA (APK)', icon: DownloadCloud },
    { id: 'all_clients', label: 'Todos os Clientes', icon: UserCheck },
    { id: 'background_editor', label: 'Gerenciar Backgrounds', icon: ImageIcon },
    { id: 'apps_editor', label: 'Gerenciar Grade de Apps', icon: AppWindow },
    { id: 'api_tester', label: 'Testador de API REST', icon: Code2 }
  ];

  // Menu do Revendedor com acesso completo aos Clientes e Instalações Pendentes
  const resellerNav = [
    { id: 'dashboard', label: 'Visão Geral & Instalações', icon: LayoutDashboard },
    { id: 'clients', label: 'Gerenciar Clientes', icon: UserCheck },
    { id: 'background_editor', label: 'Backgrounds & Carrossel', icon: ImageIcon },
    { id: 'apps_editor', label: 'Grade Fixa de Apps', icon: AppWindow },
    { id: 'api_tester', label: 'APK Coringa & Integração', icon: Code2 }
  ];

  const navItems = isMaster ? masterNav : resellerNav;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
            L
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              LUNA <span className="text-indigo-400 font-medium">LAUNCHER</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {isMaster ? 'Painel Master Admin' : 'Painel de Revendedor'}
            </p>
          </div>
        </div>

        {/* Current User Card */}
        <div className="p-3 mx-3 mt-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 text-indigo-400" />
              {isMaster ? 'MASTER ADMINISTRADOR' : 'CONTA REVENDA'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="font-bold text-white truncate">
            {activeResellerView ? activeResellerView.name : currentUser.name}
          </p>
          <p className="text-slate-400 truncate text-[11px]">
            {activeResellerView ? activeResellerView.email : currentUser.email}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
};
