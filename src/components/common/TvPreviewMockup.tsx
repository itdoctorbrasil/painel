import React, { useState } from 'react';
import { AppItem } from '../../types';
import { Tv, Wifi, Clock, Play, ExternalLink, Settings, ShieldCheck } from 'lucide-react';

interface TvPreviewMockupProps {
  backgroundUrl: string;
  overlayOpacity: number;
  apps: AppItem[];
  resellerName?: string;
  clientInfo?: {
    name: string;
    isActive: boolean;
    expirationDate: string;
  };
  compact?: boolean;
}

export const TvPreviewMockup: React.FC<TvPreviewMockupProps> = ({
  backgroundUrl,
  overlayOpacity,
  apps,
  resellerName = "Luna Launcher",
  clientInfo,
  compact = false
}) => {
  const [selectedAppIndex, setSelectedAppIndex] = useState<number>(0);
  const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`relative mx-auto w-full rounded-2xl bg-slate-950 p-3 sm:p-5 shadow-2xl border border-slate-800 ${compact ? 'max-w-2xl' : 'max-w-4xl'}`}>
      {/* TV Frame Top Bar / Branding */}
      <div className="flex items-center justify-between px-3 pb-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-200">SMART TV 4K • LUNA LAUNCHER</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 px-2 font-sans py-0.5 rounded text-[11px]">
            {resellerName}
          </span>
          <span className="text-slate-500 hidden sm:inline">Modo Exibição TV (16:9)</span>
        </div>
      </div>

      {/* TV Screen Container (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-inner group select-none">
        {/* Background Image with Layer Opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 transform group-hover:scale-105"
          style={{ backgroundImage: `url('${backgroundUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80'}')` }}
        />

        {/* Customizable Overlay Opacity */}
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
        />

        {/* Ambient Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60 pointer-events-none" />

        {/* TV Screen UI Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-6 text-white">
          
          {/* Top Bar on TV Screen */}
          <div className="flex items-center justify-between">
            {/* Brand Logo & Reseller Name */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-lg">
                L
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base tracking-wide text-white drop-shadow-md">
                  {resellerName}
                </h3>
                <p className="text-[10px] sm:text-xs text-indigo-200/80 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Sistema Original IPTV
                </p>
              </div>
            </div>

            {/* Status indicators (Time, Wifi, Client Expiration Status) */}
            <div className="flex items-center gap-3">
              {clientInfo && (
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-md border ${
                  clientInfo.isActive 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${clientInfo.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {clientInfo.isActive ? 'Assinatura Ativa' : 'Assinatura Expirada'}
                </div>
              )}

              <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-200 border border-white/10">
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono font-medium">{nowStr}</span>
              </div>
            </div>
          </div>

          {/* Central Section - Notification if Client is Expired */}
          {clientInfo && !clientInfo.isActive && (
            <div className="self-center my-auto bg-rose-950/90 border border-rose-500/50 rounded-xl p-4 max-w-md text-center backdrop-blur-md shadow-2xl">
              <p className="text-rose-200 text-xs sm:text-sm font-semibold">
                ⚠️ AVISO DE VENCIMENTO
              </p>
              <p className="text-white text-xs mt-1">
                Sua assinatura expirou. Entre em contato com seu revendedor ({resellerName}) para efetuar a renovação.
              </p>
            </div>
          )}

          {/* Bottom Grid: The 5 Fixed Apps Layout */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] uppercase tracking-wider text-indigo-200/70 font-semibold">
                Aplicativos Principais (Grade de 5 Apps)
              </span>
              <span className="text-[10px] text-slate-400">
                Pressione <kbd className="bg-slate-800 text-slate-200 px-1 rounded">◀ ▶</kbd> no controle
              </span>
            </div>

            {/* 5 App Blocks Container */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3.5">
              {apps.slice(0, 5).map((app, index) => {
                const isSelected = selectedAppIndex === index;
                return (
                  <button
                    key={app.id || index}
                    onClick={() => setSelectedAppIndex(index)}
                    className={`relative group/app flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all duration-300 text-left border ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-600/90 to-purple-700/90 border-white text-white shadow-xl shadow-indigo-500/50 scale-105 z-20 ring-2 ring-indigo-400'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/10 text-slate-200 hover:border-white/30 backdrop-blur-md'
                    }`}
                  >
                    {/* Number Badge */}
                    <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                      isSelected ? 'bg-white text-indigo-900' : 'bg-slate-800/80 text-slate-400'
                    }`}>
                      #{index + 1}
                    </span>

                    {/* App Icon */}
                    <div className="relative w-10 h-10 sm:w-14 sm:h-14 my-1.5 rounded-lg overflow-hidden bg-slate-800 shadow-md flex items-center justify-center border border-white/10">
                      {app.iconUrl ? (
                        <img
                          src={app.iconUrl}
                          alt={app.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback image if broken URL
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <Play className="w-5 h-5 text-indigo-400 absolute" />
                    </div>

                    {/* App Name */}
                    <span className="text-xs sm:text-sm font-semibold truncate w-full text-center tracking-tight">
                      {app.name || `App ${index + 1}`}
                    </span>

                    {/* Package Name snippet */}
                    <span className={`text-[9px] truncate w-full text-center mt-0.5 font-mono ${
                      isSelected ? 'text-indigo-100' : 'text-slate-400'
                    }`}>
                      {app.packageName ? app.packageName.split('.').pop() : 'pacote'}
                    </span>

                    {/* Deep Link Indicator if available */}
                    {app.deepLink && (
                      <span className="absolute top-1.5 right-1.5 bg-emerald-500/80 text-white text-[8px] px-1 rounded flex items-center gap-0.5">
                        <ExternalLink className="w-2 h-2" />
                        LINK
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* TV Stand & Footer Controls */}
      <div className="flex flex-col items-center mt-2">
        <div className="w-24 h-2 bg-slate-800 rounded-b-md shadow-inner" />
        <div className="w-40 h-1 bg-slate-800/60 rounded-full mt-0.5" />
        <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> App Selecionado: <strong className="text-white">{apps[selectedAppIndex]?.name}</strong>
          </span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-slate-400">Package: {apps[selectedAppIndex]?.packageName}</span>
        </div>
      </div>
    </div>
  );
};
