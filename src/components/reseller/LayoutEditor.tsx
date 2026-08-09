import React, { useState, useEffect, useRef } from 'react';
import { User, AppLayout, AppItem } from '../../types';
import { TvPreviewMockup } from '../common/TvPreviewMockup';
import { BACKGROUND_PRESETS, APP_PRESETS } from '../../services/mockData';
import { Tv, Image, AppWindow, Save, Check, Plus, Upload, Trash2, CheckCircle2, RotateCw } from 'lucide-react';

interface LayoutEditorProps {
  currentUser: User;
  activeResellerView?: User | null;
  layout: AppLayout | null;
  onSaveLayout: (layout: Partial<AppLayout>) => Promise<void>;
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
  const [backgroundUrls, setBackgroundUrls] = useState<string[]>([]);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.35);
  const [apps, setApps] = useState<AppItem[]>([]);

  const [newCustomBgUrl, setNewCustomBgUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when layout prop updates
  useEffect(() => {
    if (layout) {
      const activeBg = layout.backgroundUrl || BACKGROUND_PRESETS[0].url;
      const bgList = layout.backgroundUrls && layout.backgroundUrls.length > 0 
        ? layout.backgroundUrls 
        : [activeBg, ...BACKGROUND_PRESETS.map(p => p.url).filter(u => u !== activeBg)];
      
      // Ensure activeBg is in bgList
      if (!bgList.includes(activeBg)) {
        bgList.unshift(activeBg);
      }

      setBackgroundUrl(activeBg);
      setBackgroundUrls(bgList);
      setOverlayOpacity(layout.overlayOpacity ?? 0.35);
      setApps(layout.apps || []);
    } else {
      // Default initial layout
      const defaultBg = BACKGROUND_PRESETS[0].url;
      const defaultList = BACKGROUND_PRESETS.map(p => p.url);
      setBackgroundUrl(defaultBg);
      setBackgroundUrls(defaultList);
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

  // Add custom URL to gallery
  const handleAddCustomUrl = () => {
    if (!newCustomBgUrl.trim()) return;
    const url = newCustomBgUrl.trim();
    if (!backgroundUrls.includes(url)) {
      const updatedList = [url, ...backgroundUrls];
      setBackgroundUrls(updatedList);
      setBackgroundUrl(url); // Set newly added image as active
    } else {
      setBackgroundUrl(url);
    }
    setNewCustomBgUrl('');
  };

  // Upload local file and convert to Data URL for instant preview & persistence
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setBackgroundUrls((prev) => {
            if (!prev.includes(dataUrl)) {
              return [dataUrl, ...prev];
            }
            return prev;
          });
          setBackgroundUrl(dataUrl); // Set newly uploaded file as active background
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove image from gallery
  const handleRemoveImage = (urlToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filteredList = backgroundUrls.filter((u) => u !== urlToRemove);
    setBackgroundUrls(filteredList);
    
    // If removed active image, fall back to first item or preset
    if (backgroundUrl === urlToRemove) {
      setBackgroundUrl(filteredList[0] || BACKGROUND_PRESETS[0].url);
    }
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
        backgroundUrl,
        backgroundUrls,
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
            Customização Visual e Galeria de Backgrounds
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Carregue quantas imagens de fundo desejar (via URL ou Upload do seu dispositivo) e configure os 5 apps da tela principal.
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
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Layout e galeria de imagens salvos com sucesso! O aplicativo do cliente receberá todas as imagens cadastradas.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3.5 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Main Grid: Left Controls Form, Right Live TV Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: Background Gallery + 5 App Blocks (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Background Gallery Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">1. Galeria de Imagens de Fundo ({backgroundUrls.length})</h3>
              </div>
              <span className="text-[10px] bg-slate-950 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                Multinível / Multi-imagem
              </span>
            </div>

            {/* Upload & Add Controls */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <span className="text-xs font-bold text-white block">Adicionar Novas Imagens de Fundo</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                
                {/* File Upload Button */}
                <div className="sm:col-span-5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold py-2.5 px-3 rounded-xl transition text-xs flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload do Computador</span>
                  </button>
                </div>

                {/* URL Input */}
                <div className="sm:col-span-7 flex gap-1.5">
                  <input
                    type="url"
                    placeholder="Ou cole a URL da imagem (https://...)"
                    value={newCustomBgUrl}
                    onChange={(e) => setNewCustomBgUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs transition flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                💡 Você pode carregar quantas imagens quiser. Clique em qualquer imagem da galeria abaixo para definí-la como o fundo ativo na TV.
              </p>
            </div>

            {/* Active Gallery Grid */}
            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-2">
                Sua Galeria Cadastrada (Selecione a Imagem Ativa):
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 pr-2">
                {backgroundUrls.map((url, idx) => {
                  const isActive = backgroundUrl === url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setBackgroundUrl(url)}
                      className={`relative h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition group ${
                        isActive ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-[1.02]' : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img src={url} alt={`Background ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 transition ${isActive ? 'bg-indigo-950/30' : 'bg-black/30 group-hover:bg-black/10'}`} />
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> ATIVO
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveImage(url, e)}
                        className="absolute top-1.5 right-1.5 bg-rose-600/80 hover:bg-rose-600 text-white p-1 rounded transition opacity-0 group-hover:opacity-100"
                        title="Remover Imagem da Galeria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="absolute bottom-1 left-1 text-[9px] text-slate-300 font-mono drop-shadow bg-black/60 px-1 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Presets section */}
            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-2">Presites Originais de Demonstração:</label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      if (!backgroundUrls.includes(preset.url)) {
                        setBackgroundUrls([...backgroundUrls, preset.url]);
                      }
                      setBackgroundUrl(preset.url);
                    }}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3 text-indigo-400" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay Opacity Slider */}
            <div className="pt-2 border-t border-slate-800">
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
                <h3 className="font-bold text-white text-base">2. Grade Fixa de Aplicativos (Exatamente 5 Apps)</h3>
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
