import React, { useState, useEffect, useRef } from 'react';
import { User, AppLayout } from '../../types';
import { TvPreviewMockup } from '../common/TvPreviewMockup';
import { BACKGROUND_PRESETS } from '../../services/mockData';
import { Image, Save, Check, Plus, Trash2, Layers, Link as LinkIcon, Upload } from 'lucide-react';

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
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddUrl = () => {
    if (newUrlInput.trim()) {
      const updatedList = [...backgrounds, newUrlInput.trim()];
      setBackgrounds(updatedList);
      setBackgroundUrl(updatedList[0]);
      setNewUrlInput('');
    }
  };

  // Função para lidar com o upload do arquivo de imagem do banner
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica de tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato não permitido. Use JPG, PNG ou WebP.');
      return;
    }

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64String = reader.result as string;

        const response = await fetch('/api/reseller/upload-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resellerId: targetResellerId,
            fileBase64: base64String,
            fileName: file.name,
            tipo: 'banner'
          })
        });

        const data = await response.json();

        if (data.success && data.url) {
          const updatedList = [...backgrounds, data.url];
          setBackgrounds(updatedList);
          setBackgroundUrl(updatedList[0]);
        } else {
          setError(data.message || 'Erro ao enviar a imagem.');
        }
      } catch (err: any) {
        setError('Erro de conexão ao enviar o arquivo.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setUploading(false);
      setError('Erro ao ler o arquivo selecionado.');
    };
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

            {/* Input de Upload Direto e URL */}
            <div className="space-y-3">
              <label className="block text-slate-300 font-semibold text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  Faça o upload das suas imagens
                </span>
                {uploading && <span className="text-indigo-400 font-mono text-[10px] animate-pulse">A enviar imagem...</span>}
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 font-semibold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-inner"
              >
                {uploading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
                ) : (
                  <Upload className="w-4 h-4 text-indigo-400" />
                )}
                <span>{uploading ? "Salvando no Servidor..." : "Enviar fundo customizado"}</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase font-mono">ou adicione por URL direta</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Cole a URL direta da imagem (https://...)"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
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
