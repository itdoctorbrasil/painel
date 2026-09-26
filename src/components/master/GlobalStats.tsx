import React from 'react';
import { User, ApiLog, OtaVersion } from '../../types';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Activity, 
  DownloadCloud, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  ArrowUpRight,
  Tv
} from 'lucide-react';

interface GlobalStatsProps {
  stats: {
    totalResellers: number;
    blockedResellers?: number;
    activeResellers?: number;
    totalClients: number;
    activeClients: number;
    expiredClients: number;
    totalLogs?: number;
    logs?: ApiLog[];
    otaVersion?: OtaVersion | string;
  } | null;
  resellers: User[];
  onNavigateToTab: (tab: string) => void;
}

export const GlobalStats: React.FC<GlobalStatsProps> = ({
  stats,
  resellers = [],
  onNavigateToTab
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
        Carregando dados Globais...
      </div>
    );
  }

  // Cálculos seguros com fallbacks para evitar erros de renderização ou NaN
  const totalResellers = stats.totalResellers || 0;
  const activeResellers = stats.activeResellers ?? (totalResellers - (stats.blockedResellers || 0));
  const blockedResellers = stats.blockedResellers ?? (totalResellers - activeResellers);
  
  const totalClients = stats.totalClients || 0;
  const activeClients = stats.activeClients || 0;
  const expiredClients = stats.expiredClients || 0;
  
  const logsList = stats.logs || [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Painel Admin
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gerenciamento Luna Launcher
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Clientes ativos e expiradas.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigateToTab('resellers')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Users className="w-4 h-4" /> Gerenciar Clientes
            </button>
            <button
              onClick={() => onNavigateToTab('ota')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4 text-purple-400" /> Atualizar OTA
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Interativos (Direcionáveis) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revendedores */}
        <div 
          onClick={() => onNavigateToTab('resellers')}
          className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-indigo-300 transition">Revendedores</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalResellers}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{activeResellers} Ativos</span>
            <span>•</span>
            <span className="text-rose-400 font-bold">{blockedResellers} Bloqueados</span>
          </p>
        </div>

        {/* Total Clientes Finais */}
        <div 
          onClick={() => onNavigateToTab('all_clients')}
          className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-purple-300 transition">Total Dispositivos</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition">
              <Tv className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalClients}</div>
          <p className="text-xs text-slate-400 mt-1">TV Boxes cadastrados</p>
        </div>

        {/* Clientes Ativos */}
        <div 
          onClick={() => onNavigateToTab('all_clients')}
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-emerald-300 transition">Assinaturas Ativas</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">{activeClients}</div>
          <p className="text-xs text-slate-400 mt-1">
            {totalClients > 0 ? `${Math.round((activeClients / totalClients) * 100)}% de retenção` : 'Sem registros'}
          </p>
        </div>

        {/* Clientes Expirados */}
        <div 
          onClick={() => onNavigateToTab('all_clients')}
          className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-rose-300 transition">Expirados ou Bloqueados</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20 transition">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400">{expiredClients}</div>
          <p className="text-xs text-slate-400 mt-1">Exigem renovação</p>
        </div>
      </div>

      {/* Main Grid: Reseller Summary + API Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Resellers Overview Table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Resumo</h3>
              <p className="text-xs text-slate-400">Contas de clientes ativos</p>
            </div>
            <button
              onClick={() => onNavigateToTab('resellers')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              Ver Todos <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Revendedor</th>
                  <th className="p-3">Token Revenda</th>
                  <th className="p-3">Clientes Ativos</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {resellers.length > 0 ? (
                  resellers.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-white">
                        {r.name}
                        <div className="text-[11px] text-slate-400 font-normal">{r.email}</div>
                      </td>
                      <td className="p-3 font-mono text-indigo-300">{r.resellerToken || '-'}</td>
                      <td className="p-3 font-medium">
                        <span className="text-emerald-400 font-bold">{(r as any).activeClients || 0}</span>
                        <span className="text-slate-500"> / {r.clientLimit || 50} limit</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {r.status === 'active' ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onNavigateToTab('layout_editor')}
                          className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border border-indigo-500/30 cursor-pointer"
                        >
                          Ver Layout
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">
                      Nenhum revendedor cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live API Activity Logs */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="font-bold text-white text-base">Requisições da API</h3>
            </div>
            <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              Tempo Real
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1 flex-1 font-mono text-xs">
            {logsList.length > 0 ? (
              logsList.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      {log.status === 'success' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[140px]">{log.endpoint}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Token: <span className="text-indigo-300">{log.token}</span> • IP: {log.ip}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      log.responseCode === 200 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                    }`}>
                      {log.responseCode}
                    </span>
                    <p className="text-[9px] text-slate-500 mt-1">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-6">Nenhum log registrado ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
