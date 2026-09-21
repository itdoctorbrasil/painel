import React, { useState } from 'react';
import { User, AppLayout } from '../../types';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface LogoConfigProps {
  currentUser: User;
  activeResellerView: User | null;
  layout: AppLayout | null;
  onSaveLayout: (layout: Partial<AppLayout>) => Promise<void>;
}

export const LogoConfig: React.FC<LogoConfigProps> = ({
  currentUser,
  activeResellerView,
  layout,
  onSaveLayout
}) => {
  const targetUser = activeResellerView || currentUser;
  const resellerId = targetUser.id;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(layout?.logoUrl || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Selecione uma imagem para enviar.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);
      formData.append('id_revenda', resellerId);
      formData.append('token', 'REV-VIP-8822');

      // Envia para o script PHP na Hostinger usando o modo no-cors ou passando por proxy se necessário,
      // ou diretamente via fetch com tratamento de erro adequado
      const uploadRes = await fetch('https://itdoctorbrasil.site/painel-luna/clientes/upload.php', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'REV-VIP-8822'
        },
        body: formData
      });

      const uploadResult = await uploadRes.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Erro ao fazer upload na Hostinger.');
      }

      const newLogoUrl = uploadResult.url;

      // Salva a URL no MongoDB via API do painel no Render
      await onSaveLayout({
        resellerId,
        logoUrl: newLogoUrl
      });

      setSelectedFile(null);
      setPreviewUrl(newLogoUrl);
      setMessage({ type: 'success', text: 'Logo enviada e salva com sucesso!' });
    } catch (err: any) {
      // Fallback amigável caso ocorra bloqueio de CORS do navegador para a Hostinger
      console.error("Erro no upload:", err);
      setMessage({ 
        type: 'error', 
        text: 'Falha na comunicação com o servidor de hospedagem (CORS). Verifique se o arquivo upload.php na Hostinger permite requisições do Render.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl max-w-4xl mx-auto space-y-6 text-white">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <ImageIcon className="w-8 h-8 text-indigo-400" />
        <div>
          <h2 className="text-xl font-bold">Logo Customizada</h2>
          <p className="text-sm text-slate-400">Faça o upload da logo que aparecerá no canto superior esquerdo do launcher dos seus clientes.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs ${message.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200' : 'bg-rose-500/20 border border-rose-500/40 text-rose-200'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300">Selecione a Imagem (PNG, JPG ou WebP)</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-950 hover:bg-slate-800/50 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                <Upload className="w-8 h-8 mb-2 text-indigo-400" />
                <p className="text-xs text-slate-300"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                <p className="text-[10px] text-slate-500 mt-1">Recomendado fundo transparente (PNG)</p>
              </div>
              <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Enviando...' : 'Salvar e Enviar Logo'}
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">Pré-visualização no Launcher</span>
          <div className="w-56 h-24 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden shadow-inner">
            {previewUrl ? (
              <img src={previewUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs text-slate-500">Nenhuma logo definida</span>
            )}
          </div>
          {layout?.logoUrl && <span className="text-xs text-emerald-400 mt-3 flex items-center gap-1.5 font-medium">✓ Logo ativa no servidor</span>}
        </div>
      </form>
    </div>
  );
};
