import React, { useState } from 'react';
import { User } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, Key, Copy, Check, Tv, ShieldCheck, Cpu, Smartphone, ExternalLink } from 'lucide-react';

interface ApkGeneratorProps {
  currentUser: User;
  activeResellerView?: User | null;
}

export const ApkGenerator: React.FC<ApkGeneratorProps> = ({
  currentUser,
  activeResellerView
}) => {
  const activeUser = activeResellerView || currentUser;
  const resellerToken = activeUser.resellerToken || "REV-DEFAULT";
  const resellerName = activeUser.name;

  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Dynamic download URL
  const downloadUrl = `${window.location.origin}/api/v1/apk/download?token=${encodeURIComponent(resellerToken)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadApk = () => {
    setDownloading(true);
    window.location.href = downloadUrl;
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            Gerador de Launcher APK Customizado (APK Coringa)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gere o aplicativo instalável `.apk` pré-configurado com a sua Chave de Revendedor integrada no arquivo <code className="font-mono text-indigo-300">assets/config.json</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl text-xs font-mono">
          <Key className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400">Token da Revenda:</span>
          <span className="font-bold text-amber-300">{resellerToken}</span>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Download & QR Code Section (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Action Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block">Opção 1 - Injeção Dinâmica</span>
                <h3 className="text-lg font-bold text-white mt-0.5">APK Personalizado para Instalação Direta</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Pronto para Uso
              </span>
            </div>

            {/* Quick Download Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadApk}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black py-4 px-6 rounded-2xl text-sm transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 group"
              >
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition" />
                <span>{downloading ? 'Gerando e Baixando APK...' : 'BAIXAR APK CUSTOMIZADO (.APK)'}</span>
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={downloadUrl}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono rounded-xl p-2.5 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar URL'}</span>
                </button>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
              <div className="p-3 bg-white rounded-2xl shadow-xl flex-shrink-0">
                <QRCodeSVG
                  value={downloadUrl}
                  size={140}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 justify-center sm:justify-start">
                  <QrCode className="w-4 h-4" />
                  <span>Escaneie com a Câmera ou Navegador da TV Box</span>
                </div>
                <h4 className="font-bold text-white text-sm">Download Instantâneo por QR Code</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aponte a câmera do celular do seu cliente ou leia este QR Code diretamente no navegador da TV Box para baixar e instalar o aplicativo pré-configurado sem digitar nenhuma URL.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Instructions & Architecture Fallback (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Como Funciona o Fallback de Autenticação
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 block">1. Injeção de Ativo de Configuração</span>
                <p className="text-slate-400">
                  Ao clicar em baixar, o servidor lê o APK base e insere no caminho <code className="font-mono text-amber-300 text-[11px]">assets/config.json</code> os dados de homologação da sua conta de revenda.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 block">2. Primeiro Boot no Android TV (Kotlin)</span>
                <p className="text-slate-400">
                  No aplicativo Android, o módulo <code className="font-mono text-indigo-300 text-[11px]">NetworkClientHelper</code> verifica se o dispositivo possui um MAC pré-cadastrado no painel. Caso ainda não tenha sido inserido manualmente, ele utiliza a chave <code className="font-mono text-amber-300 text-[11px]">{resellerToken}</code> de fallback para carregar seu layout.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 block">3. Personalização Instantânea</span>
                <p className="text-slate-400">
                  O cliente abre o app na TV e imediatamente visualiza sua marca, sua grade de 5 apps e seu plano de fundo personalizado.
                </p>
              </div>
            </div>

            <div className="bg-indigo-950/40 border border-indigo-500/20 p-3 rounded-xl text-[11px] text-indigo-300 flex items-center gap-2">
              <Tv className="w-4 h-4 flex-shrink-0 text-indigo-400" />
              <span>Compatível com Android TV 7.0+, Fire OS e Android TV Boxes normais.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
