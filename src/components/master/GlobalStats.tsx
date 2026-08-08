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
  Clock, 
  ShieldCheck, 
  ArrowUpRight,
  Tv
} from 'lucide-react';

interface GlobalStatsProps {
  stats: {
    totalResellers: number;
    blockedResellers: number;
    totalClients: number;
    activeClients: number;
    expiredClients: number;
    totalLogs: number;
    logs: ApiLog[];
    otaVersion: OtaVersion;
  } | null;
  resellers: User[];
  onNavigateToTab: (tab: string) => void;
}

export const GlobalStats: React.FC<GlobalStatsProps> = ({
  stats,
  resellers,
  onNavigateToTab
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
        Carregando estatísticas globais...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Painel Master Admin • Solução White-Label
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gerenciamento Global Luna Launcher
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Controle a cadeia de revendedores, layouts dos dispositivos Android TV, clientes ativas/expiradas e atualizações de firmware OTA.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigateToTab('resellers')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Users className="w-4 h-4" /> Gerenciar Revendas
            </button>
            <button
              onClick={() => onNavigateToTab('ota')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-700 transition flex items-center gap-2"
            >
              <DownloadCloud className="w-4 h-4 text-purple-400" /> Atualizar OTA
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revendedores */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revendedores</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalResellers}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{stats.totalResellers - stats.blockedResellers} Ativos</span>
            <span>•</span>
            <span className="text-rose-400 font-bold">{stats.blockedResellers} Bloqueados</span>
          </p>
        </div>

        {/* Total Clientes Finais */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Dispositivos</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Tv className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalClients}</div>
          <p className="text-xs text-slate-400 mt-1">Dispositivos/TV Boxes cadastrados</p>
        </div>

        {/* Clientes Ativos */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assinaturas Ativas</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats.activeClients}</div>
          <p className="text-xs text-slate-400 mt-1">
            {stats.totalClients > 0 ? `${Math.round((stats.activeClients / stats.totalClients) * 100)}% de retenção` : 'Sem registros'}
          </p>
        </div>

        {/* Clientes Expirados */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expirados / Bloqueados</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400">{stats.expiredClients}</div>
          <p className="text-xs text-slate-400 mt-1">Exigem renovação de plano</p>
        </div>
      </div>

      {/* Main Grid: Reseller Summary + API Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Resellers Overview Table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Resumo dos Revendedores</h3>
              <p className="text-xs text-slate-400">Desempenho e limite de clientes ativas</p>
            </div>
            <button
              onClick={() => onNavigateToTab('resellers')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
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
                {resellers.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-white">
                      {r.name}
                      <div className="text-[11px] text-slate-400 font-normal">{r.email}</div>
                    </td>
                    <td className="p-3 font-mono text-indigo-300">{r.resellerToken}</td>
                    <td className="p-3 font-medium">
                      <span className="text-emerald-400 font-bold">{r.activeClients || 0}</span>
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
                        className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border border-indigo-500/30"
                      >
                        Ver Layout
                      </button>
                    </td>
                  </tr>
                ))}
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
            {stats.logs && stats.logs.length > 0 ? (
              stats.logs.map((log) => (
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
