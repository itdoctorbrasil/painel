import React, { useState, useEffect } from 'react';
import { User, AppLayout, AppItem } from '../../types';
import { TvPreviewMockup } from '../common/TvPreviewMockup';
import { APP_PRESETS } from '../../services/mockData';
import { AppWindow, Save, CheckCircle2, RotateCw } from 'lucide-react';

interface AppsGridEditorProps {
  currentUser: User;
  activeResellerView?: User | null;
  layout: AppLayout | null;
  onSaveLayout: (layoutData: any) => Promise<void>;
}

export const AppsGridEditor: React.FC<AppsGridEditorProps> = ({
  currentUser,
  activeResellerView,
  layout,
  onSaveLayout
}) => {
  const targetResellerId = activeResellerView ? activeResellerView.id : currentUser.id;
  const resellerName = activeResellerView ? activeResellerView.name : currentUser.name;

  const [apps, setApps] = useState<AppItem[]>([]);
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const [backgroundUrls, setBackgroundUrls] = useState<string[]>([]);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.35);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (layout) {
      setApps(layout.apps || []);
      setBackgroundUrl(layout.backgroundUrl || '');
      setBackgroundUrls(layout.backgroundUrls || [layout.backgroundUrl]);
      setOverlayOpacity(layout.overlayOpacity ?? 0.35);
    } else {
      setApps([
        { id: 1, name: "Luna Live IPTV", packageName: "com.luna.iptvplayer", iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80", deepLink: "luna://live" },
        { id: 2, name: "Cine Filmes & Séries", packageName: "com.luna.vodmovies", iconUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80", deepLink: "luna://vod" },
        { id: 3, name: "YouTube TV", packageName: "com.google.android.youtube.tv", iconUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=80", deepLink: "" },
        { id: 4, name: "Netflix", packageName: "com.netflix.mediaclient", iconUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80", deepLink: "" },
        { id: 5, name: "Configurações TV", packageName: "com.android.settings", iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80", deepLink: "" }
      ]);
      setBackgroundUrl("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80");
      setOverlayOpacity(0.35);
    }
  }, [layout, targetResellerId]);

  const handleAppChange = (index: number, field: keyof AppItem, value: any) => {
    const updated = [...apps];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setApps(updated);
  };

  const handleApplyAppPreset = (index: number, preset: typeof APP_PRESETS[0]) => {
    const updated = [...apps];
    updated[index] = {
      ...updated[index],
      name: preset.name,
      packageName: preset.packageName,
      iconUrl: preset.iconUrl,
      deepLink: preset.deepLink || ''
    };
    setApps(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await onSaveLayout({
        resellerId: targetResellerId,
        backgroundUrl,
        backgroundUrls,
        overlayOpacity,
        apps
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar a grade de aplicativos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <AppWindow className="w-5 h-5 text-indigo-400" />
            Gerenciamento da Grade de Aplicativos (5 Fixos)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Defina os 5 aplicativos exibidos na tela inicial do launcher nos aparelhos dos seus clientes.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          {saving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Salvando...' : 'Salvar Grade de Apps'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Grade de aplicativos salva com sucesso! Os aparelhos dos clientes receberão a atualização automaticamente.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3.5 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Main Grid: Form Left, TV Mockup Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: 5 App Editors */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-sm">
                Configuração das 5 Posições Principais
              </span>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                Exatamente 5 Ativos
              </span>
            </div>

            <div className="space-y-4">
              {apps.slice(0, 5).map((app, index) => (
                <div key={index} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                  
                  {/* Header & Preset Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                    <span className="font-bold text-xs text-indigo-300 font-mono uppercase flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        #{index + 1}
                      </span>
                      Posição {index + 1} na TV
                    </span>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 text-[11px]">Carregar Preset:</span>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = APP_PRESETS.find(p => p.name === val);
                          if (found) handleApplyAppPreset(index, found);
                        }}
                        className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Escolher App Predefinido --</option>
                        {APP_PRESETS.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Nome do App na TV</label>
                      <input
                        type="text"
                        required
                        value={app.name || ''}
                        onChange={(e) => handleAppChange(index, 'name', e.target.value)}
                        placeholder="Ex: Luna Live IPTV"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Package Name (Android Package ID)</label>
                      <input
                        type="text"
                        required
                        value={app.packageName || ''}
                        onChange={(e) => handleAppChange(index, 'packageName', e.target.value)}
                        placeholder="com.netflix.mediaclient"
                        className="w-full bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-[11px] rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">URL do Ícone do App</label>
                      <input
                        type="url"
                        value={app.iconUrl || ''}
                        onChange={(e) => handleAppChange(index, 'iconUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-900 border border-slate-800 text-white text-[11px] font-mono rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Deep Link / Direct Launch (Opcional)</label>
                      <input
                        type="text"
                        value={app.deepLink || ''}
                        onChange={(e) => handleAppChange(index, 'deepLink', e.target.value)}
                        placeholder="luna://live ou intent://..."
                        className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right TV Mockup Sticky Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              <span>Pré-Visualização ao Vivo na TV</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Ao Vivo
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Visualização exata da tela inicial no aplicativo do cliente ({resellerName}).
            </p>

            <TvPreviewMockup
              backgroundUrl={backgroundUrl}
              overlayOpacity={overlayOpacity}
              apps={apps}
              resellerName={resellerName}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
};
