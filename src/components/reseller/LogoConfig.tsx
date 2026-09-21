import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface LogoConfigProps {
  resellerId: string;
}

export const LogoConfig: React.FC<LogoConfigProps> = ({ resellerId }) => {
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Busca a configuração atual do layout do revendedor
  useEffect(() => {
    fetch(`/api/reseller/layout/${resellerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.logoUrl) {
          setLogoUrl(data.logoUrl);
          setPreviewUrl(data.logoUrl);
        }
      })
      .catch((err) => console.error('Erro ao carregar layout:', err));
  }, [resellerId]);

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

      // Envia diretamente para o script PHP na Hostinger
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

      // Salva a nova URL da logo no banco de dados via API do Render
      const layoutRes = await fetch('/api/reseller/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resellerId,
          logoUrl: newLogoUrl
        })
      });

      if (!layoutRes.ok) {
        throw new Error('Erro ao salvar a URL da logo no banco de dados.');
      }

      setLogoUrl(newLogoUrl);
      setSelectedFile(null);
      setMessage({ type: 'success', text: 'Logo enviada e salva com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Ocorreu um erro inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-xl max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <ImageIcon className="w-8 h-8 text-sky-400" />
        <div>
          <h2 className="text-xl font-bold">Logo Customizada (White-Label)</h2>
          <p className="text-sm text-slate-400">Faça o upload da logo que aparecerá no canto superior esquerdo do launcher dos seus clientes.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-900/50 border border-emerald-500 text-emerald-200' : 'bg-rose-900/50 border border-rose-500 text-rose-200'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">Selecione a Imagem (PNG, JPG ou WebP)</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700/50 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <p className="text-sm text-slate-400"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                <p className="text-xs text-slate-500">PNG, JPG ou WebP (Recomendado fundo transparente)</p>
              </div>
              <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Enviando...' : 'Salvar e Enviar Logo'}
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-950/50 rounded-xl border border-slate-800">
          <span className="text-sm font-medium text-slate-400 mb-4">Pré-visualização Atual</span>
          <div className="w-48 h-20 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center p-2 relative overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs text-slate-500">Nenhuma logo definida</span>
            )}
          </div>
          {logoUrl && <span className="text-xs text-emerald-400 mt-2">✓ Logo ativa no servidor</span>}
        </div>
      </form>
    </div>
  );
};
