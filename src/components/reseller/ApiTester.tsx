import React, { useState, useEffect } from 'react';
import { User, ClientDevice, LauncherConfigResponse, LauncherVersionResponse } from '../../types';
import { fetchLauncherConfig, fetchLauncherVersion } from '../../services/api';
import { Code2, Play, Copy, Check, ExternalLink, RefreshCw, Key, ShieldCheck, Terminal, Cpu } from 'lucide-react';
import { JsonViewerModal } from '../common/JsonViewerModal';

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
  
  const [testToken, setTestToken] = useState<string>(initialTestToken || resellerToken || 'REV-VIP-8822');
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  
  const [configResponse, setConfigResponse] = useState<any>(null);
  const [versionResponse, setVersionResponse] = useState<any>(null);
  const [appsResponse, setAppsResponse] = useState<any>(null);
  const [imgResponse, setImgResponse] = useState<any>(null);

  const [copiedCurl, setCopiedCurl] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [activeModalData, setActiveModalData] = useState<{ title: string; url: string; data: any }>({ title: '', url: '', data: null });

  const originUrl = window.location.origin;

  // Run test fetch on mount or when token changes
  useEffect(() => {
    const token = initialTestToken || testToken;
    if (initialTestToken) {
      setTestToken(initialTestToken);
    }
    runAllTests(token);
  }, [initialTestToken]);

  const runAllTests = (tokenToTest: string) => {
    runConfigTest(tokenToTest);
    runAppsTest(tokenToTest);
    runImgTest(tokenToTest);
    runVersionTest();
  };

  const runConfigTest = async (tokenToTest: string) => {
    setLoadingConfig(true);
    try {
      const res = await fetchLauncherConfig(tokenToTest);
      setConfigResponse(res);
    } catch (err: any) {
      setConfigResponse({
        status: 'error',
        message: err.message || 'Falha ao conectar na API',
        background: { url: '', overlayOpacity: 0 },
        apps: []
      });
    } finally {
      setLoadingConfig(false);
    }
  };

  const runAppsTest = async (tokenToTest: string) => {
    setLoadingApps(true);
    try {
      const res = await fetch(`${originUrl}/apps.json?token=${encodeURIComponent(tokenToTest)}`);
      const data = await res.json();
      setAppsResponse(data);
    } catch (err: any) {
      setAppsResponse({ status: 'error', message: err.message });
    } finally {
      setLoadingApps(false);
    }
  };

  const runImgTest = async (tokenToTest: string) => {
    setLoadingImg(true);
    try {
      const res = await fetch(`${originUrl}/img.json?token=${encodeURIComponent(tokenToTest)}`);
      const data = await res.json();
      setImgResponse(data);
    } catch (err: any) {
      setImgResponse({ status: 'error', message: err.message });
    } finally {
      setLoadingImg(false);
    }
  };

  const runVersionTest = async () => {
    setLoadingVersion(true);
    try {
      const res = await fetchLauncherVersion();
      setVersionResponse(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingVersion(false);
    }
  };

  const appsEndpointUrl = `${originUrl}/apps.json?token=${encodeURIComponent(testToken)}`;
  const imgEndpointUrl = `${originUrl}/img.json?token=${encodeURIComponent(testToken)}`;
  const configEndpointUrl = `${originUrl}/api/v1/launcher/config?token=${encodeURIComponent(testToken)}`;
  const versionEndpointUrl = `${originUrl}/version.json`;

  const curlCommand = `# 1. Checar Aplicativos (apps.json)
curl -X GET "${appsEndpointUrl}"

# 2. Checar Imagem de Fundo (img.json)
curl -X GET "${imgEndpointUrl}"

# 3. Checar Atualizações OTA (version.json)
curl -X GET "${versionEndpointUrl}"

# 4. Configuração Unificada (config API)
curl -X GET "${configEndpointUrl}"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const openModalFor = (title: string, url: string, data: any) => {
    setActiveModalData({ title, url, data });
    setShowJsonModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Documentação da API REST para Android (Java / Kotlin)
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-7 h-7 text-indigo-400" />
            Endpoints de Integração do Luna Launcher
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Utilize estes endpoints REST no aplicativo Android do Luna Launcher para carregar as imagens de fundo, os 5 aplicativos da grade inicial e checar atualizações OTA.
          </p>
        </div>
      </div>

      {/* Interactive Token Selector & Test Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" />
          Testar Endpoints com Token de Dispositivo ou Revenda
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[280px]">
            <label className="block text-slate-400 text-xs font-semibold mb-1">
              Token para Teste (Token do Dispositivo OU Token da Revenda):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                placeholder="Insira o Token do Dispositivo ou Token da Revenda"
                className="w-full bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold text-xs sm:text-sm rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => runAllTests(testToken)}
                disabled={loadingConfig || loadingApps || loadingImg}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-600/30"
              >
                {loadingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>Testar Todos</span>
              </button>
            </div>
          </div>

          {/* Quick Select Buttons from Existing Clients */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">Escolher dos Meus Clientes:</label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  setTestToken(e.target.value);
                  runAllTests(e.target.value);
                }
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none cursor-pointer"
            >
              <option value={resellerToken}>Usar Token de Revenda ({resellerToken})</option>
              {clients.map(c => (
                <option key={c.id} value={c.deviceToken}>
                  {c.clientName} ({c.deviceToken})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of 4 Main API Endpoints expected by Luna Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Endpoint: apps.json */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  GET REST / JSON
                </span>
                <h3 className="font-extrabold text-white text-base mt-1">
                  1. Grade de Aplicativos (apps.json)
                </h3>
              </div>
              <a
                href={appsEndpointUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
              >
                Abrir URL <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Retorna os 5 aplicativos configurados com suporte a múltiplos nomes de campos (<code className="text-emerald-300 font-mono">packageName, package, iconUrl, icon, name, title</code>) para compatibilidade instantânea com o Luna Launcher.
            </p>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-300 break-all mb-4">
              <span className="text-emerald-400 font-bold">URL: </span>
              {appsEndpointUrl}
            </div>

            {/* Response Viewer */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-emerald-400 max-h-64 overflow-y-auto shadow-inner">
              {loadingApps ? (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                  Carregando apps.json...
                </div>
              ) : (
                <pre>{JSON.stringify(appsResponse, null, 2)}</pre>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">Response HTTP 200 OK</span>
            <button
              onClick={() => openModalFor('Grade de Aplicativos (apps.json)', appsEndpointUrl, appsResponse)}
              className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white px-3 py-1.5 rounded-lg font-semibold transition border border-emerald-500/30"
            >
              Expandir JSON
            </button>
          </div>
        </div>

        {/* 2. Endpoint: img.json */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold">
                  GET REST / JSON
                </span>
                <h3 className="font-extrabold text-white text-base mt-1">
                  2. Imagem de Fundo (img.json)
                </h3>
              </div>
              <a
                href={imgEndpointUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono"
              >
                Abrir URL <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Retorna o papel de parede personalizado com os alias de chaves (<code className="text-blue-300 font-mono">backgroundUrl, bg_url, img_url, url, opacity</code>) para exibição imediata no app.
            </p>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-300 break-all mb-4">
              <span className="text-blue-400 font-bold">URL: </span>
              {imgEndpointUrl}
            </div>

            {/* Response Viewer */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-blue-300 max-h-64 overflow-y-auto shadow-inner">
              {loadingImg ? (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                  Carregando img.json...
                </div>
              ) : (
                <pre>{JSON.stringify(imgResponse, null, 2)}</pre>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">Response HTTP 200 OK</span>
            <button
              onClick={() => openModalFor('Imagem de Fundo (img.json)', imgEndpointUrl, imgResponse)}
              className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white px-3 py-1.5 rounded-lg font-semibold transition border border-blue-500/30"
            >
              Expandir JSON
            </button>
          </div>
        </div>

        {/* 3. Endpoint: version.json */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
                  GET REST / JSON
                </span>
                <h3 className="font-extrabold text-white text-base mt-1">
                  3. Atualizações OTA (version.json)
                </h3>
              </div>
              <a
                href={versionEndpointUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-mono"
              >
                Abrir URL <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Retorna as informações do arquivo <code className="text-purple-300 font-mono">version.json</code> com suporte a <code className="text-purple-300 font-mono">versionCode, version_code, apk_url, download_url</code>.
            </p>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-300 break-all mb-4">
              <span className="text-purple-400 font-bold">URL: </span>
              {versionEndpointUrl}
            </div>

            {/* Response Viewer */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-purple-300 max-h-64 overflow-y-auto shadow-inner">
              {loadingVersion ? (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                  Carregando version.json...
                </div>
              ) : (
                <pre>{JSON.stringify(versionResponse, null, 2)}</pre>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">Response HTTP 200 OK</span>
            <button
              onClick={() => openModalFor('Atualizações OTA (version.json)', versionEndpointUrl, versionResponse)}
              className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white px-3 py-1.5 rounded-lg font-semibold transition border border-purple-500/30"
            >
              Expandir JSON
            </button>
          </div>
        </div>

        {/* 4. Endpoint: /api/v1/launcher/config (Configuração Completa) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-bold">
                  GET REST API
                </span>
                <h3 className="font-extrabold text-white text-base mt-1">
                  4. Payload Unificado (/config)
                </h3>
              </div>
              <a
                href={configEndpointUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-mono"
              >
                Abrir URL <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Payload único que agrupa layout, apps, fundo e validação de assinatura do cliente num só request HTTP.
            </p>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-300 break-all mb-4">
              <span className="text-indigo-400 font-bold">URL: </span>
              {configEndpointUrl}
            </div>

            {/* Response Viewer */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-amber-300 max-h-64 overflow-y-auto shadow-inner">
              {loadingConfig ? (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                  Carregando config...
                </div>
              ) : (
                <pre>{JSON.stringify(configResponse, null, 2)}</pre>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono">Response HTTP 200 OK</span>
            <button
              onClick={() => openModalFor('Configuração Completa do Launcher', configEndpointUrl, configResponse)}
              className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg font-semibold transition border border-indigo-500/30"
            >
              Expandir JSON
            </button>
          </div>
        </div>

      </div>

      {/* cURL Code Snippet Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Comandos cURL de Exemplo para Teste no Terminal</h3>
          </div>
          <button
            onClick={handleCopyCurl}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCurl ? 'Copiado!' : 'Copiar cURL'}</span>
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre">
          <pre>{curlCommand}</pre>
        </div>
      </div>

      {/* JSON Modal */}
      <JsonViewerModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        title={activeModalData.title || "Estrutura do JSON"}
        endpointUrl={activeModalData.url || configEndpointUrl}
        jsonData={activeModalData.data}
      />
    </div>
  );
};
