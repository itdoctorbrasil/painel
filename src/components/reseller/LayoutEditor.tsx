import React, { useState, useEffect } from 'react';
import { User, AppLayout, AppItem } from '../../types';
import { TvPreviewMockup } from '../common/TvPreviewMockup';
import { BACKGROUND_PRESETS, APP_PRESETS } from '../../services/mockData';
import { Tv, Image, AppWindow, Sparkles, Save, Check, ExternalLink, RotateCcw, Layers, Upload, Plus, Trash2 } from 'lucide-react';

interface LayoutEditorProps {
  currentUser: User;
  activeResellerView?: User | null;
  layout: AppLayout | null;
  onSaveLayout: (layout: Partial<AppLayout> & { backgrounds?: string[] }) => Promise<void>;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  currentUser,
  activeResellerView,
  layout,
  onSaveLayout
}) => {
  const targetResellerId = activeResellerView ? activeResellerView.id : currentUser.id;
  const resellerName = activeResellerView ? activeResellerView.name : currentUser.name;

  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState<string>('');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.35);
  const [apps, setApps] = useState<AppItem[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when layout prop updates
  useEffect(() => {
    if (layout) {
      const initialBg = layout.backgroundUrl || BACKGROUND_PRESETS[0].url;
      const initialBgList = (layout as any).backgrounds && (layout as any).backgrounds.length > 0
        ? (layout as any).backgrounds
        : [initialBg];

      setBackgroundUrl(initialBg);
      setBackgrounds(initialBgList);
      setOverlayOpacity(layout.overlayOpacity ?? 0.35);
      setApps(layout.apps || []);
    } else {
      // Default 5 apps
      const defaultBg = BACKGROUND_PRESETS[0].url;
      setBackgroundUrl(defaultBg);
      setBackgrounds([defaultBg]);
      setOverlayOpacity(0.35);
      setApps([
        { id: 1, name: "Luna Live IPTV", packageName: "com.luna.iptvplayer", iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80", deepLink: "" },
        { id: 2, name: "Cine Filmes & Séries", packageName: "com.luna.vodmovies", iconUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80", deepLink: "" },
        { id: 3, name: "YouTube TV", packageName: "com.google.android.youtube.tv", iconUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop&q=80", deepLink: "" },
        { id: 4, name: "Netflix", packageName: "com.netflix.mediaclient", iconUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80", deepLink: "" },
        { id: 5, name: "Configurações TV", packageName: "com.android.settings", iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80", deepLink: "" }
      ]);
    }
  }, [layout, targetResellerId]);

  // Upload do computador (Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("O arquivo excede o limite de 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        const updatedList = [...backgrounds, base64Image];
        setBackgrounds(updatedList);
        setBackgroundUrl(updatedList[0]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Adicionar URL de imagem
  const handleAddUrl = () => {
    if (newUrlInput.trim()) {
      const updatedList = [...backgrounds, newUrlInput.trim()];
      setBackgrounds(updatedList);
      setBackgroundUrl(updatedList[0]);
      setNewUrlInput('');
    }
  };

  // Remover imagem da galeria
  const handleRemoveImage = (indexToRemove: number) => {
    if (backgrounds.length <= 1) {
      alert("O carrossel do launcher precisa ter no mínimo 1 imagem de fundo.");
      return;
    }
    const updatedList = backgrounds.filter((_, idx) => idx !== indexToRemove);
    setBackgrounds(updatedList);
    setBackgroundUrl(updatedList[0]);
  };

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
      iconUrl: preset.iconUrl
    };
    setApps(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await onSaveLayout({
        resellerId: targetResellerId,
        backgroundUrl: backgrounds[0] || backgroundUrl,
        backgrounds: backgrounds,
        overlayOpacity,
        apps
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar layout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-400" />
            Customização Visual da Tela Inicial (Grade de 5 Apps)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure a imagem de fundo e os 5 aplicativos fixos da tela principal. O resultado é atualizado ao vivo no Mockup de TV ao lado.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          {saving ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
          <span>Salvar Alterações de Layout</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Layout atualizado com sucesso! As Smart TVs conectadas a esta revenda receberão o novo fundo e os 5 apps configurados.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3.5 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Main Grid: Left Controls Form, Right Live TV Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: Background + 5 App Blocks (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Background Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">1. Imagem de Fundo (Background TV)</h3>
              </div>
              <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded font-mono">1920x1080 HD</span>
            </div>

            {/* Ações de Upload e Inserção por URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold py-2.5 px-3 rounded-xl cursor-pointer transition text-xs">
                <Upload className="w-4 h-4" />
                <span>Carregar Imagem do PC</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Ou cole a URL (https://...)"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs font-mono rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Galeria de Backgrounds Ativos no Carrossel */}
            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-2">
                Galeria de Backgrounds do Carrossel ({backgrounds.length})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {backgrounds.map((bg, idx) => (
                  <div key={idx} className="relative h-16 rounded-xl overflow-hidden border border-slate-800 group bg-slate-950">
                    <img src={bg} alt={`Background ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="bg-rose-600/90 hover:bg-rose-600 text-white p-1.5 rounded-lg transition"
                        title="Remover Imagem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[8px] font-mono px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Background Presets */}
            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-2">Ou selecione de um Fundo HD Preset:</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      if (!backgrounds.includes(preset.url)) {
                        setBackgrounds([...backgrounds, preset.url]);
                      }
                      setBackgroundUrl(preset.url);
                    }}
                    className={`relative h-16 rounded-xl overflow-hidden border transition group ${
                      backgroundUrl === preset.url ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-105' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition" />
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-bold truncate text-center drop-shadow">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay Opacity Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Opacidade da Máscara Escura (Escurecimento para Leitura)</span>
                <span className="font-mono text-indigo-400">{Math.round(overlayOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 2. Fixed 5 Apps Grid Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AppWindow className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">2. Grade Fixa de Aplicativos (Exactamente 5 Apps)</h3>
              </div>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                Tela Inicial Launcher
              </span>
            </div>

            {/* App Editors */}
            <div className="space-y-4">
              {apps.slice(0, 5).map((app, index) => (
                <div key={index} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                  
                  {/* App Header & Presets Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                    <span className="font-bold text-xs text-indigo-300 font-mono uppercase flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        #{index + 1}
                      </span>
                      Posição {index + 1} na TV
                    </span>

                    {/* Quick Preset Selection dropdown */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 text-[11px]">Aplicar Preset:</span>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = APP_PRESETS.find(p => p.name === val);
                          if (found) handleApplyAppPreset(index, found);
                        }}
                        className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Escolher Preset --</option>
                        {APP_PRESETS.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* App Input Fields Grid */}
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
                      <label className="block text-slate-400 font-medium mb-1">Package Name (Android ID)</label>
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

        {/* Right TV Mockup Sticky Preview (5 Cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              <span>Pré-Visualização em Tempo Real na TV</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Ao Vivo
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Exatamente como a interface é renderizada no Luna Launcher no aparelho do seu cliente.
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
