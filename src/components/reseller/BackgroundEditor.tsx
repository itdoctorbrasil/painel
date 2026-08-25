import React, { useState, useEffect } from 'react';
import { User, AppLayout } from '../../types';
import { TvPreviewMockup } from '../common/TvPreviewMockup';
import { BACKGROUND_PRESETS } from '../../services/mockData';
import { Image, Save, Check, Upload, Plus, Trash2, Layers } from 'lucide-react';

interface BackgroundEditorProps {
  currentUser: User;
  activeResellerView?: User | null;
  layout: AppLayout | null;
  onSaveLayout: (layout: Partial<AppLayout> & { backgrounds?: string[] }) => Promise<void>;
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
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState<string>('');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.35);
  const [apps, setApps] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const defaultBg = BACKGROUND_PRESETS[0].url;
      setBackgroundUrl(defaultBg);
      setBackgrounds([defaultBg]);
      setOverlayOpacity(0.35);
    }
  }, [layout, targetResellerId]);

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

  const handleAddUrl = () => {
    if (newUrlInput.trim()) {
      const updatedList = [...backgrounds, newUrlInput.trim()];
      setBackgrounds(updatedList);
      setBackgroundUrl(updatedList[0]);
      setNewUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (backgrounds.length <= 1) {
      alert("O carrossel do launcher precisa ter no mínimo 1 imagem de fundo.");
      return;
    }
    const updatedList = backgrounds.filter((_, idx) => idx !== indexToRemove);
    setBackgrounds(updatedList);
    setBackgroundUrl(updatedList[0]);
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
      setError(err.message || 'Erro ao salvar backgrounds');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Gerenciamento de Backgrounds & Carrossel HD
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure as imagens de fundo e o nível de escurecimento para leitura na TV do cliente.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          {saving ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
          <span>Salvar Backgrounds</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Backgrounds atualizados com sucesso!</span>
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Planos de Fundo da Tela Inicial</h3>
              </div>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded font-mono">
                1920x1080 HD
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold py-3 px-4 rounded-xl cursor-pointer transition text-xs">
                <Upload className="w-4 h-4" />
                <span>Carregar Imagem do PC</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Cole a URL direta (https://...)"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-3 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-2">
                Galeria Ativa no Carrossel ({backgrounds.length} imagens)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {backgrounds.map((bg, idx) => (
                  <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-slate-800 group bg-slate-950 shadow-md">
                    <img src={bg} alt={`Background ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-lg transition cursor-pointer"
                        title="Remover Imagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-2">Fundos HD Preset:</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
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
                    className={`relative h-18 rounded-xl overflow-hidden border transition group cursor-pointer ${
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

            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
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
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
              <span>Pré-Visualização em Tempo Real na TV</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Ao Vivo
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Exatamente como o fundo é renderizado na TV.</p>
            <TvPreviewMockup
              backgroundUrl={backgroundUrl || backgrounds[0]}
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
