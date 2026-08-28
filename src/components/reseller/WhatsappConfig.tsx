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
        body: JSON.stringify({ resellerId: targetUser.id, whatsapp: formattedWhatsapp })
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
            QR Code do WhatsApp de Suporte
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Configure o número de atendimento. O sistema gerará automaticamente o QR Code exibido na tela inicial do Launcher para os seus clientes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulário de Número */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base">Número de Atendimento</h3>
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
              <p className="text-[11px] text-slate-500 mt-1">Link gerado: <code className="text-emerald-400">wa.me/+{formattedWhatsapp || '55xxxxxxxxx'}</code></p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Salvo com Sucesso!' : 'Salvar Número'}</span>
            </button>
          </form>
        </div>

        {/* Pré-visualização do QR Code */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center space-y-3">
          <h3 className="font-bold text-white text-base">Pré-visualização na TV</h3>
          <div className="bg-white p-4 rounded-2xl shadow-inner">
            {formattedWhatsapp.length > 8 ? (
              <img src={qrCodeImageUrl} alt="QR Code WhatsApp" className="w-[160px] h-[160px] object-contain" />
            ) : (
              <div className="w-[160px] h-[160px] flex items-center justify-center text-xs text-slate-400 bg-slate-100 rounded-lg">
                Insira o número ao lado
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">Apontado para o atendimento</span>
        </div>
      </div>
    </div>
  );
};
