import React, { useState, useEffect } from 'react';
import { User, OtaVersion } from '../../types';
import { Download, Eye, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  activeTab: string;
  resellers: User[];
  activeResellerView?: User | null;
  onSelectResellerView: (reseller: User | null) => void;
  otaVersion?: OtaVersion;
  onOpenOtaModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  resellers,
  activeResellerView,
  onSelectResellerView,
  otaVersion,
  onOpenOtaModal
}) => {
  // Estado do Tema (Dark por padrão, salvo em localStorage)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('luna_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('luna_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return currentUser.role === 'master' && !activeResellerView ? 'Visão Geral do Sistema White-Label' : 'Painel de Controle da Revenda';
      case 'resellers':
        return 'Gerenciamento de Revendedores';
      case 'ota':
        return 'Gerenciador de Atualizações OTA (version.json)';
      case 'all_clients':
      case 'clients':
        return 'Gerenciamento de Clientes & Dispositivos';
      case 'background_editor':
        return 'Gerenciamento de Backgrounds & Carrossel HD';
      case 'apps_editor':
        return 'Gerencie aqui os aplicativos fixos';
      case 'api_tester':
        return 'Download Launcher';
      default:
        return 'Painel Luna Launcher';
    }
  };

  return (
    <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          {getTitle()}
          {activeResellerView && (
            <span className="text-xs font-normal bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Visão: {activeResellerView.name}
            </span>
          )}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Obtenha aqui seu link para download ou baixe o Luna Launcher diretamente
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        
        {/* Master: Quick Reseller Switcher */}
        {currentUser.role === 'master' && (
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 hidden sm:inline font-medium">Ver como Revenda:</span>
            <select
              value={activeResellerView ? activeResellerView.id : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onSelectResellerView(null);
                } else {
                  const found = resellers.find(r => r.id === val);
                  onSelectResellerView(found || null);
                }
              }}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-300">Todas / Modo Master</option>
              {resellers.map(r => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                  {r.name} ({r.resellerToken})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* OTA Status Badge */}
        {otaVersion && (
          <button
            onClick={onOpenOtaModal}
            className="flex items-center gap-2 bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
            title="Clique para ver detalhes do OTA version.json"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
            <span>Luna v{otaVersion.versionName}</span>
            <span className="bg-indigo-500 text-white text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
              Build {otaVersion.versionCode}
            </span>
          </button>
        )}

        {/* Botão de Alternância de Tema (Diurno / Noturno) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition shadow-sm cursor-pointer flex items-center justify-center"
          title={theme === 'dark' ? 'Mudar para Modo Diurno' : 'Mudar para Modo Noturno'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>
      </div>
    </header>
  );
};
