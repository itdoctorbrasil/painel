import React, { useState, useEffect } from 'react';
import { User, AppLayout, AppItem, AppLayoutsMap, LayoutSlotId } from '../../types';
import { TvPreviewMockup } from '../common/TvPreviewMockup';
import { APP_PRESETS, BACKGROUND_PRESETS } from '../../services/mockData';
import { AppWindow, Save, Check, Layers, Copy } from 'lucide-react';

interface AppLayoutsEditorProps {
  currentUser: User;
  activeResellerView?: User | null;
  layout: AppLayout | null;
  onSaveLayout: (layout: Partial<AppLayout>) => Promise<void>;
}

const DEFAULT_FIVE_APPS: AppItem[] = [
  { id: 1, name: "Luna Live IPTV", packageName: "com.luna.iptvplayer", iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80", deepLink: "" },
  { id: 2, name: "Cine Filmes & Séries", packageName: "com.luna.vodmovies", iconUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80", deepLink: "" },
  { id: 3, name: "YouTube TV", packageName: "com.google.android.youtube.tv", iconUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=80", deepLink: "" },
  { id: 4, name: "Netflix", packageName: "com.netflix.mediaclient", iconUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80", deepLink: "" },
  { id: 5, name: "Configurações TV", packageName: "com.android.settings", iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80", deepLink: "" }
];

function normalizeFiveApps(source?: AppItem[], fallback?: AppItem[]): AppItem[] {
  const base = (source && source.length > 0)
    ? source
    : (fallback && fallback.length > 0 ? fallback : DEFAULT_FIVE_APPS);

  return Array.from({ length: 5 }, (_, idx) => {
    const item = base[idx] || DEFAULT_FIVE_APPS[idx];
    return {
      id: item?.id ?? idx + 1,
      name: item?.name || '',
      packageName: item?.packageName || '',
      iconUrl: item?.iconUrl || '',
      deepLink: item?.deepLink || ''
    };
  });
}

export const AppLayoutsEditor: React.FC<AppLayoutsEditorProps> = ({
  currentUser,
  activeResellerView,
  layout,
  onSaveLayout
}) => {
  const targetResellerId = activeResellerView ? activeResellerView.id : currentUser.id;
  const resellerName = activeResellerView ? activeResellerView.name : currentUser.name;

  const [selectedSlot, setSelectedSlot] = useState<LayoutSlotId>(1);
  const [appLayouts, setAppLayouts] = useState<AppLayoutsMap>({
    layout1: normalizeFiveApps(),
    layout2: normalizeFiveApps(),
    layout3: normalizeFiveApps()
  });

  const [backgroundUrl, setBackgroundUrl] = useState<string>(BACKGROUND_PRESETS[0].url);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.35);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (layout) {
      setBackgroundUrl(layout.backgroundUrl || BACKGROUND_PRESETS[0].url);
      setOverlayOpacity(layout.overlayOpacity ?? 0.35);
      const baseApps = layout.apps && layout.apps.length > 0 ? layout.apps : DEFAULT_FIVE_APPS;
      setAppLayouts({
        layout1: normalizeFiveApps(layout.appLayouts?.layout1, baseApps),
        layout2: normalizeFiveApps(layout.appLayouts?.layout2, baseApps),
        layout3: normalizeFiveApps(layout.appLayouts?.layout3, baseApps)
      });
    } else {
      setAppLayouts({
        layout1: normalizeFiveApps(DEFAULT_FIVE_APPS),
        layout2: normalizeFiveApps(DEFAULT_FIVE_APPS),
        layout3: normalizeFiveApps(DEFAULT_FIVE_APPS)
      });
    }
  }, [layout, targetResellerId]);

  const activeKey = `layout${selectedSlot}` as keyof AppLayoutsMap;
  const activeApps = appLayouts[activeKey];

  const handleAppChange = (index: number, field: keyof AppItem, value: any) => {
    setAppLayouts(prev => {
      const updatedSlot = [...prev[activeKey]];
      updatedSlot[index] = {
        ...updatedSlot[index],
        [field]: value
      };
      return {
        ...prev,
        [activeKey]: updatedSlot
      };
    });
  };

  const handleApplyAppPreset = (index: number, preset: typeof APP_PRESETS[0]) => {
    setAppLayouts(prev => {
      const updatedSlot = [...prev[activeKey]];
      updatedSlot[index] = {
        ...updatedSlot[index],
        name: preset.name,
        packageName: preset.packageName,
        iconUrl: preset.iconUrl,
        deepLink: preset.deepLink || ''
      };
      return {
        ...prev,
        [activeKey]: updatedSlot
      };
    });
  };

  const handleCopyFromLayout1 = () => {
    setAppLayouts(prev => ({
      ...prev,
      [activeKey]: prev.layout1.map(app => ({ ...app }))
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await onSaveLayout({
        resellerId: targetResellerId,
        apps: appLayouts.layout1,
        appLayouts
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar layouts da grade de aplicativos');
    } finally {
      setSaving(false);
    }
  };

  const layoutSlots: { id: LayoutSlotId; label: string; badge: string }[] = [
    { id: 1, label: 'Layout 1', badge: 'Padrão' },
    { id: 2, label: 'Layout 2', badge: 'Alternativo 1' },
    { id: 3, label: 'Layout 3', badge: 'Alternativo 2' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Gerenciamento de Layouts (Grade Fixa de Apps)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure até 3 layouts independentes com os 5 aplicativos fixos e escolha qual aplicar ao cadastrar cada aparelho.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          {saving ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
          <span>Salvar Layouts</span>
        </button>
      </div>

      {/* Seletor dos 3 Layouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {layoutSlots.map((slot) => {
          const isSelected = selectedSlot === slot.id;
          const slotApps = appLayouts[`layout${slot.id}` as keyof AppLayoutsMap];
          const appNamesSummary = slotApps
            .map(a => a.name)
            .filter(Boolean)
            .slice(0, 3)
            .join(', ');

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => setSelectedSlot(slot.id)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-600/25 via-purple-600/15 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`font-extrabold text-sm flex items-center gap-2 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {slot.id}
                  </span>
                  {slot.label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}>
                  {slot.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {appNamesSummary || '5 aplicativos configuráveis'}
              </p>
            </button>
          );
        })}
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Layouts (1, 2 e 3) atualizados com sucesso!</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3.5 rounded-xl text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AppWindow className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  Layout {selectedSlot} — Grade de 5 Atalhos Principais
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedSlot !== 1 && (
                  <button
                    type="button"
                    onClick={handleCopyFromLayout1}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition cursor-pointer"
                    title="Copiar os 5 aplicativos do Layout 1 para este layout"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar do Layout 1
                  </button>
                )}
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded font-mono">
                  Layout {selectedSlot}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {activeApps.slice(0, 5).map((app, index) => (
                <div key={`${selectedSlot}-${index}`} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                    <span className="font-bold text-xs text-indigo-300 font-mono uppercase flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        #{index + 1}
                      </span>
                      Posição {index + 1} na TV (Layout {selectedSlot})
                    </span>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 text-[11px]">Aplicar Preset:</span>
                      <select
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = APP_PRESETS.find(p => p.name === val);
                          if (found) handleApplyAppPreset(index, found);
                        }}
                        className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Escolher App Preset --</option>
                        {APP_PRESETS.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Nome do App na TV</label>
                      <input
                        type="text"
                        required
                        value={app.name || ''}
                        onChange={(e) => handleAppChange(index, 'name', e.target.value)}
                        placeholder="Ex: Luna Live IPTV"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Package Name (Android ID)</label>
                      <input
                        type="text"
                        required
                        value={app.packageName || ''}
                        onChange={(e) => handleAppChange(index, 'packageName', e.target.value)}
                        placeholder="com.netflix.mediaclient"
                        className="w-full bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-[11px] rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">URL do Ícone do App</label>
                      <input
                        type="url"
                        value={app.iconUrl || ''}
                        onChange={(e) => handleAppChange(index, 'iconUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-900 border border-slate-800 text-white text-[11px] font-mono rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">URL de Download</label>
                      <input
                        type="text"
                        value={app.deepLink || ''}
                        onChange={(e) => handleAppChange(index, 'deepLink', e.target.value)}
                        placeholder="luna://live ou intent://..."
                        className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              <span>Pré-Visualização — Layout {selectedSlot}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Ao Vivo
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Exatamente como os 5 aplicativos do Layout {selectedSlot} são renderizados na TV.
            </p>
            <TvPreviewMockup
              backgroundUrl={backgroundUrl}
              overlayOpacity={overlayOpacity}
              apps={activeApps}
              resellerName={resellerName}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
};
