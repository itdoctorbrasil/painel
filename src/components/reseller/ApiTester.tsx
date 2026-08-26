import React, { useState } from 'react';
import { User, ClientDevice } from '../../types';
import { Copy, Check, DownloadCloud, ExternalLink } from 'lucide-react';

interface ApiTesterProps {
  currentUser: User;
  activeResellerView?: User | null;
  clients: ClientDevice[];
  initialTestToken?: string;
}

export const ApiTester: React.FC<ApiTesterProps> = ({
  currentUser,
  activeResellerView,
  clients,
  initialTestToken
}) => {
  const resellerToken = activeResellerView ? activeResellerView.resellerToken : currentUser.resellerToken;
  
  const [copiedLink, setCopiedLink] = useState(false);

  // URL DO SCRIPT PHP DINÂMICO QUE RENOMEIA O APK COM O TOKEN DA REVENDA
  const wildCardApkUrl = `https://itdoctorbrasil.site/Launchers/Luna/download.php?token=${encodeURIComponent(resellerToken || '')}`;

  const handleCopyWildcardLink = () => {
    navigator.clipboard.writeText(wildCardApkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* SEÇÃO SUPERIOR: Gerenciamento do Link / Cópia com o mesmo formato de frame */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <DownloadCloud className="w-7 h-7 text-indigo-400" />
            Download Launcher
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Gere o link exclusivo de instalação da revenda ou baixe diretamente o pacote configurado com o seu token.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-indigo-900/40 border border-indigo-500/30 px-3 py-2 rounded-xl text-right">
            <span className="block text-[9px] text-slate-400 font-mono">SEU TOKEN ATIVO</span>
            <span className="text-xs font-mono font-bold text-amber-300">{resellerToken}</span>
          </div>

          {/* Botão com o mesmo formato de frame e moldura do Baixar Launcher */}
          <button
            onClick={handleCopyWildcardLink}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 border border-slate-700 cursor-pointer shadow-lg"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link de Instalação'}</span>
          </button>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: Download Direto do APK */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 shadow-xl space-y-6">
        <div>
          <h3 className="font-extrabold text-white text-xl flex items-center gap-2">
            <DownloadCloud className="w-6 h-6 text-indigo-400" />
            APK Coringa da Revenda
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Clique no botão abaixo para baixar o arquivo instalador do Luna Launcher diretamente para o seu dispositivo com o token da revenda embutido.
          </p>
        </div>

        <div className="pt-2">
          <a
            href={wildCardApkUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm transition inline-flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shadow-lg"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            <span>Baixar Launcher</span>
          </a>
        </div>
      </div>

    </div>
  );
};
