import React, { useState, useRef } from 'react';
import { User, AppLayout } from '../../types';
import { Video, Upload, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface BootVideoConfigProps {
  currentUser: User;
  activeResellerView: User | null;
  layout: AppLayout | null;
  onSaveLayout: (layout: Partial<AppLayout>) => Promise<void>;
}

export const BootVideoConfig: React.FC<BootVideoConfigProps> = ({
  currentUser,
  activeResellerView,
  layout,
  onSaveLayout
}) => {
  const targetUser = activeResellerView || currentUser;
  const resellerId = targetUser.id;

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('video/')) {
      setErrorMsg('Por favor, selecione um arquivo de vídeo válido (MP4, WebM, etc).');
      return;
    }

    setUploading(true);
    setUploadProgress(5);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('id_revenda', resellerId);
      formData.append('tipo', 'bootvideo');
      formData.append('bootvideo', file, file.name);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://itdoctorbrasil.site/painel-luna/clientes/upload.php', true);
      xhr.setRequestHeader('X-Api-Key', 'REV-VIP-8822');
      xhr.setRequestHeader('Accept', 'application/json');

      if (xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(percent);
          }
        };
      }

      xhr.onload = async () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && res.success && res.url) {
            setUploadProgress(100);
            await onSaveLayout({
              ...layout,
              bootVideoUrl: res.url
            });
            setSuccessMsg('Vídeo de boot atualizado com sucesso!');
          } else {
            setErrorMsg(res.message || 'Erro retornado pelo servidor de upload.');
          }
        } catch (err) {
          setErrorMsg('Erro ao processar a resposta do servidor PHP.');
        } finally {
          setUploading(false);
        }
      };

      xhr.onerror = () => {
        setErrorMsg('Erro de rede ou bloqueio de CORS ao tentar enviar o vídeo.');
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao preparar o arquivo para envio.');
      setUploading(false);
    }
  };

  const handleRemoveVideo = async () => {
    if (confirm('Deseja remover o vídeo de boot customizado? O launcher usará o padrão.')) {
      try {
        await onSaveLayout({
          ...layout,
          bootVideoUrl: ''
        });
        setSuccessMsg('Vídeo removido com sucesso.');
      } catch (err: any) {
        setErrorMsg('Erro ao remover o vídeo.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-indigo-400" />
            Vídeo de Boot Customizado
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personalize o vídeo de introdução exibido nas TV boxes ao iniciar o Luna Launcher.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/50 text-center">
          {layout?.bootVideoUrl ? (
            <div className="w-full space-y-4">
              <div className="relative max-w-md mx-auto aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                <video src={layout.bootVideoUrl} controls className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {uploading ? `A enviar... ${uploadProgress}%` : 'Substituir Vídeo'}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  disabled={uploading}
                  className="px-4 py-2 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition border border-rose-500/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remover
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-6 w-full max-w-md">
              <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Nenhum vídeo customizado enviado</h3>
                <p className="text-xs text-slate-400 mt-1">Envie um arquivo de vídeo (MP4) otimizado para o boot.</p>
              </div>

              {uploading ? (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span>A transferir para o servidor...</span>
                    <span className="font-bold text-indigo-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 cursor-pointer w-full"
                >
                  Selecionar Vídeo do Computador
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/mkv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};
