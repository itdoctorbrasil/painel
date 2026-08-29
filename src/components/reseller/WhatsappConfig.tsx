import React, { useState } from 'react';
import { User } from '../../types';
import { MessageSquare, Save, Check } from 'lucide-react';

interface WhatsappConfigProps {
  currentUser: User;
  activeResellerView?: User | null;
}

export const WhatsappConfig: React.FC<WhatsappConfigProps> = ({ currentUser, activeResellerView }) => {
  const targetUser = activeResellerView || currentUser;
  const [whatsapp, setWhatsapp] = useState(targetUser.whatsapp || '');
  const [showWhatsapp, setShowWhatsapp] = useState<boolean>((targetUser as any).showWhatsapp ?? true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const formattedWhatsapp = whatsapp.replace(/\D/g, '');
  const waLink = `https://wa.me/+${formattedWhatsapp}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(waLink)}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/reseller/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resellerId: targetUser.id, whatsapp: formattedWhatsapp, showWhatsapp })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Erro ao salvar WhatsApp:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-emerald-400" />
            QR Code do WhatsApp para suporte e renovação
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Neste menu você pode configurar o número de telefone para os seus clientes scanearem o QR CODE para suporte via Whatsapp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulário de Configuração e Número */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base">LIGAR OU DESLIGAR</h3>
          
          {/* Botão Switch Estilo Slider ON / OFF */}
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-white text-sm font-bold block">Status no Launcher</span>
              <span className="text-slate-400 text-xs">Exibir QR Code na Luna Launcher</span>
            </div>
            <button
              type="button"
              onClick={() => setShowWhatsapp(!showWhatsapp)}
              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer px-2 ${
                showWhatsapp ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-rose-500 shadow-lg shadow-rose-500/20'
              }`}
            >
              <span className={`text-[11px] font-black text-white absolute ${showWhatsapp ? 'left-3' : 'right-3'}`}>
                {showWhatsapp ? 'ON' : 'OFF'}
              </span>
              <div
                className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  showWhatsapp ? 'translate-x-9' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">WhatsApp (DDI + DDD + Número):</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 5511999887766"
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl p-3 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">O seu link gerado é: <code className="text-emerald-400">wa.me/+{formattedWhatsapp || '55xxxxxxxxx'}</code></p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Configuração Salva!' : 'Salvar Alterações'}</span>
            </button>
          </form>
        </div>

        {/* Pré-visualização do QR Code com Feedback Visual ON/OFF */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center space-y-3">
          <h3 className="font-bold text-white text-base">Pré-visualização na Luna Launcher</h3>
          <div className={`p-4 rounded-2xl transition duration-300 ${showWhatsapp ? 'bg-white opacity-100 shadow-inner' : 'bg-slate-950 opacity-30 grayscale'}`}>
            {formattedWhatsapp.length > 8 ? (
              <img src={qrCodeImageUrl} alt="QR Code WhatsApp" className="w-[160px] h-[160px] object-contain" />
            ) : (
              <div className="w-[160px] h-[160px] flex items-center justify-center text-xs text-slate-400 bg-slate-100 rounded-lg">
                Insira o número ao lado
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {showWhatsapp ? 'Exibição Ativada no Launcher' : 'Exibição Oculta para os Clientes'}
          </span>
        </div>
      </div>
    </div>
  );
};
