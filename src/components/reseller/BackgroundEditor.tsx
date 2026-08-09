import React, { useState, useEffect, useRef } from 'react';
import { User, AppLayout, AppItem } from '../../types';
import { TvPreviewMockup } from '../common/TvPreviewMockup';
import { BACKGROUND_PRESETS } from '../../services/mockData';
import { Image, Save, Plus, Upload, Trash2, CheckCircle2, RotateCw, Check } from 'lucide-react';

interface BackgroundEditorProps {
  currentUser: User;
  activeResellerView?: User | null;
  layout: AppLayout | null;
  onSaveLayout: (layoutData: any) => Promise<void>;
}

export const BackgroundEditor: React.FC<BackgroundEditorProps> = ({
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

  useEffect(() => {
    if (layout) {
      const activeBg = layout.backgroundUrl || BACKGROUND_PRESETS[0].url;
      const bgList = layout.backgroundUrls && layout.backgroundUrls.length > 0
        ? layout.backgroundUrls
        : [activeBg, ...BACKGROUND_PRESETS.map(p => p.url).filter(u => u !== activeBg)];

      if (!bgList.includes(activeBg)) {
        bgList.unshift(activeBg);
      }

      setBackgroundUrl(activeBg);
      setBackgroundUrls(bgList);
      setOverlayOpacity(layout.overlayOpacity ?? 0.35);
      setApps(layout.apps || []);
    } else {
      const defaultBg = BACKGROUND_PRESETS[0].url;
      const defaultList = BACKGROUND_PRESETS.map(p => p.url);
      setBackgroundUrl(defaultBg);
      setBackgroundUrls(defaultList);
      setOverlayOpacity(0.35);
    }
  }, [layout, targetResellerId]);

  const handleAddCustomUrl = () => {
    if (!newCustomBgUrl.trim()) return;
    const url = newCustomBgUrl.trim();
    if (!backgroundUrls.includes(url)) {
      const updatedList = [url, ...backgroundUrls];
      setBackgroundUrls(updatedList);
      setBackgroundUrl(url);
    } else {
      setBackgroundUrl(url);
    }
    setNewCustomBgUrl('');
  };

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
          setBackgroundUrl(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (urlToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filteredList = backgroundUrls.filter((u) => u !== urlToRemove);
    setBackgroundUrls(filteredList);

    if (backgroundUrl === urlToRemove) {
      setBackgroundUrl(filteredList[0] || BACKGROUND_PRESETS[0].url);
    }
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
      setError(err.message || 'Erro ao salvar o plano de fundo.');
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
            <Image className="w-5 h-5 text-indigo-400" />
            Background / Fundo TV & Galeria
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie o carrossel de imagens de fundo, faça upload de fotos locais e ajuste a opacidade da máscara de leitura.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          {saving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Salvando...' : 'Salvar Fundo da TV'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Imagens e configurações salvas com sucesso! O carrossel da TV foi atualizado.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3.5 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Main Grid: Form Left, TV Mockup Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: Background Upload + Gallery + Opacity */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-sm">
                Galeria de Imagens do Carrossel ({backgroundUrls.length})
              </span>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                Rotatividade HD 1080p
              </span>
            </div>

            {/* Upload & Add URL Controls */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <span className="text-xs font-bold text-white block">Adicionar Novas Imagens de Fundo</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                {/* File Upload */}
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
                    <span>Upload de Arquivo</span>
                  </button>
                </div>

                {/* URL Input */}
                <div className="sm:col-span-7 flex gap-1.5">
                  <input
                    type="url"
                    placeholder="Cole a URL da imagem (https://...)"
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
                💡 Clique em qualquer imagem da galeria abaixo para configurá-la como imagem principal de fundo da TV.
              </p>
            </div>

            {/* Gallery Grid */}
            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-2">
                Galeria do Seu Launcher (Selecione a Imagem Ativa):
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
                      <div className={`absolute inset-0 transition ${isActive ? 'bg-indigo-950/20' : 'bg-black/30 group-hover:bg-black/10'}`} />

                      {isActive && (
                        <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> ATIVO
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleRemoveImage(url, e)}
                        className="absolute top-1.5 right-1.5 bg-rose-600/80 hover:bg-rose-600 text-white p-1 rounded transition opacity-0 group-hover:opacity-100"
                        title="Remover Imagem"
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

            {/* Presets */}
            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-2">Presets Rápidos HD:</label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      if (!backgroundUrls.includes(preset.url)) {
                        setBackgroundUrls([...backgroundUrls, preset.url]);
                      }
                      setBackgroundUrl(preset.url);
                    }}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3 text-indigo-400" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Escurecimento para Leitura (Opacidade da Máscara)</span>
                <span className="font-mono text-indigo-400">{Math.round(overlayOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.85"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Transparente (0%)</span>
                <span>Normal (35%)</span>
                <span>Escuro (85%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right TV Mockup Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              <span>Pré-Visualização ao Vivo na TV</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Ao Vivo
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Visualização exata da imagem de fundo e máscara no aparelho do seu cliente ({resellerName}).
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
