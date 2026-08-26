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
    <div className="space-y-6 w-full">
      
      {/* Bloco 1: Download Launcher (Copiar Link) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="space-y-6 flex-1">
          <div>
            <h3 className="font-extrabold text-white text-xl flex items-center gap-2">
              <DownloadCloud className="w-6 h-6 text-indigo-400" />
              Download Launcher
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Gere o link exclusivo de instalação da revenda ou baixe diretamente o pacote configurado com o seu token.
            </p>
          </div>
          
          <button
            onClick={handleCopyWildcardLink}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shadow-lg w-fit"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link de Instalação'}</span>
          </button>
        </div>

        {/* Token Badge à direita */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 px-4 py-2.5 rounded-xl text-right shrink-0 mt-2 sm:mt-0">
          <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider mb-0.5">Seu Token Ativo</span>
          <span className="text-sm font-mono font-bold text-amber-300">{resellerToken}</span>
        </div>
      </div>

      {/* Bloco 2: APK Coringa da Revenda (Download Direto) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h3 className="font-extrabold text-white text-xl flex items-center gap-2">
            <DownloadCloud className="w-6 h-6 text-indigo-400" />
            APK Coringa da Revenda
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            Clique no botão abaixo para baixar o arquivo instalador do Luna Launcher diretamente para o seu dispositivo com o token da revenda embutido.
          </p>
        </div>

        <div>
          <a
            href={wildCardApkUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition inline-flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shadow-lg w-fit"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            <span>Baixar Launcher</span>
          </a>
        </div>
      </div>

    </div>
  );
};
