import React, { useState } from 'react';
import { OtaVersion } from '../../types';
import { DownloadCloud, Check, Code, ShieldCheck, AlertCircle, FileCode, Upload, ExternalLink, Sparkles } from 'lucide-react';
import { JsonViewerModal } from '../common/JsonViewerModal';

interface OtaManagementProps {
  otaVersion: OtaVersion;
  onSaveOtaVersion: (data: Partial<OtaVersion>) => Promise<void>;
}

export const OtaManagement: React.FC<OtaManagementProps> = ({
  otaVersion,
  onSaveOtaVersion
}) => {
  const [formData, setFormData] = useState<Partial<OtaVersion>>({
    versionCode: otaVersion.versionCode,
    versionName: otaVersion.versionName,
    downloadUrl: otaVersion.downloadUrl,
    forceUpdate: otaVersion.forceUpdate,
    releaseNotes: otaVersion.releaseNotes,
    minSupportedVersion: otaVersion.minSupportedVersion
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await onSaveOtaVersion(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar versão OTA');
    } finally {
      setSaving(false);
    }
  };

  const handleSimulateUpload = () => {
    const randomBuild = Math.floor(105 + Math.random() * 20);
    const vName = `2.2.${Math.floor(Math.random() * 10)}`;
    setFormData({
      ...formData,
      versionCode: randomBuild,
      versionName: vName,
      downloadUrl: `https://lunalauncher.app/downloads/luna-launcher-v${vName}.apk`,
      releaseNotes: `• Atualização da versão v${vName}\n• Otimização para Smart TVs Android 13/14\n• Correções gerais no reprodutor VOD`
    });
  };

  const currentPayload = {
    versionCode: formData.versionCode,
    versionName: formData.versionName,
    downloadUrl: formData.downloadUrl,
    forceUpdate: formData.forceUpdate,
    releaseNotes: formData.releaseNotes,
    minSupportedVersion: formData.minSupportedVersion,
    updatedAt: new Date().toISOString()
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Somente Master Admin
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <DownloadCloud className="w-7 h-7 text-purple-400" />
            Módulo OTA • Gerenciador de Atualizações
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Controle a distribuição do APK do Luna Launcher <code className="bg-black/40 px-1.5 py-0.5 rounded text-purple-300 font-mono">version.json</code>.
          </p>
        </div>

        <button
          onClick={() => setShowJsonModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
        >
          <Code className="w-4 h-4" /> Ver JSON ao Vivo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Controls */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white">Configurações do APK / version.json</h3>
              <p className="text-xs text-slate-400">Preencha os dados do novo pacote APK gerado no Android Studio</p>
            </div>
            <button
              type="button"
              onClick={handleSimulateUpload}
              className="bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Simular Upload de Novo APK
            </button>
          </div>

          {savedSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3.5 rounded-xl text-xs mb-5 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Configuração da versão OTA salva com sucesso! O arquivo <strong>version.json</strong> foi atualizado para os aparelhos.</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3.5 rounded-xl text-xs mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Version Code (Número de Build do Android)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.versionCode}
                  onChange={(e) => setFormData({ ...formData, versionCode: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl p-3 focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Ex: 104 (deve ser incrementado a cada novo APK publicado)</p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Version Name (Nome Visível da Versão)
                </label>
                <input
                  type="text"
                  required
                  placeholder="2.1.0"
                  value={formData.versionName}
                  onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-purple-300 font-mono font-bold rounded-xl p-3 focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Ex: 2.1.0 (exibido na tela de configurações da TV)</p>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                URL de Download Direto do APK (.apk)
              </label>
              <input
                type="url"
                required
                placeholder="https://suadominio.com/downloads/luna-launcher-v2.1.0.apk"
                value={formData.downloadUrl}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">O Luna Launcher fará o download direto e acionará o instalador silencioso/padrão do Android.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Forçar Atualização Obrigatória (Force Update)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Se ativado, impede o usuário de fechar a janela de atualização até baixar o novo APK.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.forceUpdate}
                  onChange={(e) => setFormData({ ...formData, forceUpdate: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Versão Mínima Suportada (minSupportedVersion)
              </label>
              <input
                type="number"
                min="1"
                value={formData.minSupportedVersion}
                onChange={(e) => setFormData({ ...formData, minSupportedVersion: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl p-3 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Release Notes (Notas da Versão / O que mudou?)
              </label>
              <textarea
                rows={4}
                value={formData.releaseNotes}
                onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-purple-500"
                placeholder="• Melhorias na navegação com D-Pad&#10;• Correção de reprodução VOD&#10;• Suporte a novo codec de vídeo"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                {saving ? 'Publicando...' : 'Salvar & Publicar OTA version.json'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Payload Preview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Estrutura do version.json</h3>
              </div>
              <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-mono">GET /api/v1/launcher/version</span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Este é o código retornado diretamente para a aplicação Android do Luna Launcher quando checa por atualizações:
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-purple-300 overflow-x-auto shadow-inner">
              <pre>{JSON.stringify(currentPayload, null, 2)}</pre>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <a
              href="/api/v1/launcher/version"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 p-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              Testar Endpoint no Navegador <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* JSON Viewer Modal */}
      <JsonViewerModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        title="Estrutura da API OTA (version.json)"
        endpointUrl={`${window.location.origin}/api/v1/launcher/version`}
        jsonData={currentPayload}
      />
    </div>
  );
};
